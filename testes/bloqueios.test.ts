// Fase 9, item 1.4: auditoria dos bloqueios no motor (CR 509, 510, 702, 802), caso a caso, e o bloqueio do bot.
import { describe, expect, it } from 'vitest';
import { HeuristicBot } from '../bots/heuristico.ts';
import { danoPadrao, defaultAnswer } from '../motor/ask.ts';
import type { Answer, Decision, ObjId, TargetRef } from '../motor/types.ts';
import { P, setup, type TestGame } from './harness.ts';

type DBloqueio = Extract<Decision, { kind: 'blockers' }>;
type DDano = Extract<Decision, { kind: 'damage' }>;

/** guarda as decisões de bloqueio que aparecem e responde com `resposta` (padrão: não bloquear) */
function capturarBloqueios(tg: TestGame, resposta: (d: DBloqueio, tg: TestGame) => Answer = () => ({ kind: 'blockers', blocks: [] })): DBloqueio[] {
  const vistas: DBloqueio[] = [];
  const f = (d: Decision, x: TestGame): Answer | null => {
    if (d.kind !== 'blockers') return null;
    vistas.push(d);
    tg.script.push(f); // continua valendo para os próximos defensores
    return resposta(d, x);
  };
  tg.script.push(f);
  return vistas;
}

/** responde a distribuição de dano com `assign` e guarda a decisão */
function dividirDano(tg: TestGame, assign: (d: DDano) => number[]): DDano[] {
  const vistas: DDano[] = [];
  tg.script.push((d) => (d.kind === 'damage' ? (vistas.push(d), { kind: 'damage', assign: assign(d) }) : null));
  return vistas;
}

const obj = (id: ObjId): TargetRef => ({ kind: 'obj', id });
const noCemiterio = (tg: TestGame, p: number, nome: string) => tg.names(p, 'graveyard').includes(nome);

describe('fase 9 (1.4): bloqueios', () => {
  it('1. um bloqueador: só ele bloqueia, os dois trocam dano e o defensor não perde vida', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Kami of Ancient Law'], ['Goblin Electromancer']] });
    tg.attack([['Kami of Ancient Law', 1]]);
    const vistas = capturarBloqueios(tg, (d, x) => ({ kind: 'blockers', blocks: [[x.bf('Goblin Electromancer'), x.bf('Kami of Ancient Law')]] }));
    tg.passTo('main2');
    expect(vistas).toHaveLength(1);
    expect(vistas[0].player).toBe(1);
    expect(vistas[0].attackers).toHaveLength(1);
    expect(vistas[0].candidates.map((c) => c.canBlock.length)).toEqual([1]);
    expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
    expect(noCemiterio(tg, 1, 'Goblin Electromancer')).toBe(true);
    expect(tg.life(1)).toBe(40);
  });

  it('2. vários bloqueadores: quem ataca divide o dano como quiser, sem ordem de dano (CR 510.1c)', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Defiling Daemogoth'], ['Kami of Ancient Law', 'Goblin Electromancer']] });
    tg.attack([['Defiling Daemogoth', 1]]).block([['Kami of Ancient Law', 'Defiling Daemogoth'], ['Goblin Electromancer', 'Defiling Daemogoth']]);
    let recusas: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'damage') return null;
      expect(d.player).toBe(0);
      expect(d.amount).toBe(5);
      expect(d.lethal).toEqual([2, 2]);
      expect(d.trample).toBe(false);
      recusas = [[2, 2], [0, 5], [5, 0], [1, 4]].map((assign) => x.game.check(d.player, { kind: 'damage', assign }));
      // a resposta padrão do motor soma o dano todo (antes devolvia só os letais, 2 + 2)
      expect(x.game.check(d.player, defaultAnswer(d))).toBeNull();
      return { kind: 'damage', assign: [0, 5] };
    });
    tg.passTo('main2');
    expect(recusas[0]).toMatch(/exatamente 5/);
    expect(recusas.slice(1)).toEqual([null, null, null]);
    // todo o dano no segundo bloqueador: o primeiro sobrevive; os dois juntos (4) matam o Daemogoth
    expect(tg.find('Kami of Ancient Law', 'battlefield', 1)).not.toBeNull();
    expect(noCemiterio(tg, 1, 'Goblin Electromancer')).toBe(true);
    expect(noCemiterio(tg, 0, 'Defiling Daemogoth')).toBe(true);
    expect(tg.life(1)).toBe(40);
  });

  it('2b. a resposta padrão da divisão de dano é sempre válida (com e sem atropelar, dano maior ou menor que o letal)', () => {
    const base = { id: 1, player: 0, prompt: '', attacker: 1, error: undefined } as const;
    const d = (amount: number, lethal: number[], trample: boolean): DDano => ({ ...base, kind: 'damage', amount, lethal, trample, recipients: lethal.map((_, i) => obj(10 + i)) });
    expect(danoPadrao(d(5, [2, 2], false))).toEqual([2, 3]);
    expect(danoPadrao(d(3, [2, 2], false))).toEqual([2, 1]);
    expect(danoPadrao(d(5, [2, 1, 0], true))).toEqual([2, 1, 2]);
    expect(danoPadrao(d(2, [2, 1, 0], true))).toEqual([2, 0, 0]);
  });

  it('3. voar e alcance: a voadora só é bloqueada por quem voa ou tem alcance; quem voa bloqueia qualquer uma', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Drumbellower', 'Kami of Ancient Law'], ['Goblin Electromancer', 'Arboreal Grazer', 'Archfiend of Depravity']] });
    tg.attack([['Drumbellower', 1], ['Kami of Ancient Law', 1]]);
    let recusa: string | null = null;
    const vistas = capturarBloqueios(tg, (d, x) => {
      recusa = x.game.check(d.player, { kind: 'blockers', blocks: [[x.bf('Goblin Electromancer'), x.bf('Drumbellower')]] });
      return { kind: 'blockers', blocks: [[x.bf('Arboreal Grazer'), x.bf('Drumbellower')], [x.bf('Archfiend of Depravity'), x.bf('Kami of Ancient Law')]] };
    });
    const voadora = tg.bf('Drumbellower'), chao = tg.bf('Kami of Ancient Law');
    tg.passTo('main2');
    const pode = (nome: string) => vistas[0].candidates.find((c) => c.obj === tg.bf(nome, 1))!.canBlock.sort();
    expect(pode('Goblin Electromancer')).toEqual([chao]);
    expect(pode('Arboreal Grazer')).toEqual([voadora, chao].sort());
    expect(pode('Archfiend of Depravity')).toEqual([voadora, chao].sort());
    expect(recusa).toMatch(/não pode bloquear/);
    expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
    expect(tg.life(1)).toBe(40);
  });

  it('4. ameaça: um bloqueador só é recusado; dois valem (CR 702.111b)', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [["Teacher's Pest"], ['Kami of Ancient Law', 'Goblin Electromancer']] });
    tg.attack([["Teacher's Pest", 1]]);
    let sozinho: string | null = null;
    capturarBloqueios(tg, (d, x) => {
      const pest = x.bf("Teacher's Pest");
      sozinho = x.game.check(d.player, { kind: 'blockers', blocks: [[x.bf('Kami of Ancient Law'), pest]] });
      return { kind: 'blockers', blocks: [[x.bf('Kami of Ancient Law'), pest], [x.bf('Goblin Electromancer'), pest]] };
    });
    dividirDano(tg, (d) => danoPadrao(d));
    tg.passTo('main2');
    expect(sozinho).toMatch(/menace/);
    expect(noCemiterio(tg, 0, "Teacher's Pest")).toBe(true);
    expect(tg.life(1)).toBe(40);
  });

  it('5. primeiro golpe: quem bate antes e mata não leva dano; golpe duplo bate duas vezes', () => {
    // atacante com primeiro golpe mata o bloqueador antes de levar dano
    let tg = setup({ step: 'beginCombat', battlefield: [['Relic Retriever'], ['Kami of Ancient Law']] });
    tg.attack([['Relic Retriever', 1]]).block([['Kami of Ancient Law', 'Relic Retriever']]);
    tg.passTo('main2');
    expect(noCemiterio(tg, 1, 'Kami of Ancient Law')).toBe(true);
    expect(tg.state.objects[tg.bf('Relic Retriever')].damage).toBe(0);
    // bloqueador com primeiro golpe mata o atacante antes de levar dano
    tg = setup({ step: 'beginCombat', battlefield: [['Kami of Ancient Law'], ['White Orchid Phantom']] });
    tg.attack([['Kami of Ancient Law', 1]]).block([['White Orchid Phantom', 'Kami of Ancient Law']]);
    tg.passTo('main2');
    expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
    expect(tg.state.objects[tg.bf('White Orchid Phantom')].damage).toBe(0);
    // golpe duplo: bloqueado, bate duas vezes no bloqueador; sem bloqueio, duas vezes no jogador
    tg = setup({ step: 'beginCombat', battlefield: [['Cyan, Vengeful Samurai'], ['Indomitable Ancients']] });
    tg.attack([['Cyan, Vengeful Samurai', 1]]).block([['Indomitable Ancients', 'Cyan, Vengeful Samurai']]);
    tg.passTo('main2');
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(6);
    expect(tg.state.objects[tg.bf('Cyan, Vengeful Samurai')].damage).toBe(2);
    tg = setup({ step: 'beginCombat', battlefield: [['Cyan, Vengeful Samurai'], []] });
    tg.attack([['Cyan, Vengeful Samurai', 1]]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(34);
  });

  it('6. atropelar com dois bloqueadores: letal em todos antes do jogador; sem bloqueador no fim, tudo no jogador', () => {
    const pest = 'Eccentric Pestfinder // Turn Stones';
    let tg = setup({ step: 'beginCombat', battlefield: [[pest], ['Kami of Ancient Law', 'Elvish Mystic']] });
    tg.attack([[pest, 1]]).block([['Kami of Ancient Law', pest], ['Elvish Mystic', pest]]);
    let recusa: string | null = null;
    tg.script.push((d, x) => {
      if (d.kind !== 'damage') return null;
      expect(d.trample).toBe(true);
      expect(d.recipients[2]).toEqual(P(1));
      expect(d.lethal).toEqual([2, 1, 0]);
      recusa = x.game.check(d.player, { kind: 'damage', assign: [1, 1, 3] });
      return { kind: 'damage', assign: [2, 1, 2] };
    });
    tg.passTo('main2');
    expect(recusa).toMatch(/702\.19b/);
    expect(tg.life(1)).toBe(38);
    expect(noCemiterio(tg, 1, 'Kami of Ancient Law') && noCemiterio(tg, 1, 'Elvish Mystic')).toBe(true);
    // o bloqueador sai antes do dano: com atropelar, o dano todo vai para o jogador (CR 702.19e)
    tg = setup({ step: 'beginCombat', battlefield: [[pest], ['Kami of Ancient Law']], graveyard: [[], []] });
    tg.attack([[pest, 1]]).block([['Kami of Ancient Law', pest]]);
    tg.passUntil((x) => x.state.turn.step === 'declareBlockers');
    tg.state.objects[tg.bf('Kami of Ancient Law')].damage = 99; // morre nas ações de estado antes do dano
    tg.refresh();
    tg.passTo('main2');
    expect(noCemiterio(tg, 1, 'Kami of Ancient Law')).toBe(true);
    expect(tg.life(1)).toBe(35);
  });

  it('7. quatro jogadores: cada defensor só bloqueia quem ataca ele (ou um planeswalker dele); quem não é atacado não decide', () => {
    const tg = setup({
      players: 4, step: 'beginCombat',
      battlefield: [['Kami of Ancient Law', 'Goblin Electromancer', 'Elvish Mystic'], ['Indomitable Ancients'], ['Arboreal Grazer'], ['Wall of Omens', { name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]],
    });
    const qui = tg.bf('Quintorius, History Chaser');
    const [kami, goblin, mystic] = ['Kami of Ancient Law', 'Goblin Electromancer', 'Elvish Mystic'].map((n) => tg.bf(n));
    tg.attack([[kami, 1], [goblin, 2], [mystic, obj(qui)]]);
    const recusas: (string | null)[] = [];
    const vistas = capturarBloqueios(tg, (d, x) => {
      // tentar bloquear quem ataca outro jogador é recusado
      const outro = d.player === 1 ? goblin : kami;
      const meu = d.candidates[0].obj;
      recusas.push(x.game.check(d.player, { kind: 'blockers', blocks: [[meu, outro]] }));
      return { kind: 'blockers', blocks: [[meu, d.candidates[0].canBlock[0]]] };
    });
    tg.passTo('main2');
    // os três defensores, na ordem dos assentos (APNAP), cada um vendo só quem o ataca (o 3 pelo planeswalker)
    expect(vistas.map((v) => v.player)).toEqual([1, 2, 3]);
    expect(vistas.map((v) => v.attackers)).toEqual([[kami], [goblin], [mystic]]);
    for (const v of vistas) expect(v.candidates.every((c) => c.canBlock.length === 1 && c.canBlock[0] === v.attackers[0])).toBe(true);
    expect(recusas).toHaveLength(3);
    for (const r of recusas) expect(r).toMatch(/não pode bloquear/);
    // os bloqueios valeram: Kami morre no Indomitable Ancients; o planeswalker não perde lealdade
    expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
    expect(tg.state.objects[qui].counters.loyalty).toBe(5);
    expect(tg.life(1) + tg.life(2) + tg.life(3)).toBe(120);
  });

  it('7b. quatro jogadores: quem não é atacado não recebe a decisão de bloqueio', () => {
    const tg = setup({ players: 4, step: 'beginCombat', battlefield: [['Kami of Ancient Law'], ['Goblin Electromancer'], ['Arboreal Grazer'], ['Wall of Omens']] });
    tg.attack([['Kami of Ancient Law', 2]]);
    const vistas = capturarBloqueios(tg);
    tg.passTo('main2');
    expect(vistas.map((v) => v.player)).toEqual([2]);
    expect(tg.life(2)).toBe(38);
  });

  describe('8. o bot bloqueando', () => {
    const doBot = (tg: TestGame) => capturarBloqueios(tg, (d, x) => new HeuristicBot('teste', d.player).answer(d, x.game));
    it('bloqueia para matar e sobreviver', () => {
      const tg = setup({ step: 'beginCombat', battlefield: [['Kami of Ancient Law'], ['Indomitable Ancients']] });
      tg.attack([['Kami of Ancient Law', 1]]);
      doBot(tg);
      tg.passTo('main2');
      expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
      expect(tg.life(1)).toBe(40);
    });
    it('não troca com quem tem primeiro golpe (morreria sem causar dano)', () => {
      const tg = setup({ step: 'beginCombat', battlefield: [['Relic Retriever'], ['Elvish Mystic']] });
      tg.attack([['Relic Retriever', 1]]);
      const vistas = capturarBloqueios(tg, (d, x) => new HeuristicBot('teste', d.player).answer(d, x.game));
      tg.passTo('main2');
      expect(vistas).toHaveLength(1);
      expect(tg.find('Elvish Mystic', 'battlefield', 1)).not.toBeNull();
      expect(tg.life(1)).toBe(38);
    });
    it('um atacante com ameaça não derruba os outros bloqueios do bot', () => {
      // antes: o bloqueio sozinho no Daemogoth (o maior, primeiro da lista) era inválido e o bot tirava bloqueios do
      // fim da lista até sobrar nenhum; o Kami, que ele bloquearia de graça, passava
      const tg = setup({ step: 'beginCombat', battlefield: [['Defiling Daemogoth', 'Kami of Ancient Law'], ['Canopy Gargantuan', 'Indomitable Ancients']] });
      tg.attack([['Defiling Daemogoth', 1], ['Kami of Ancient Law', 1]]);
      const respostas: Answer[] = [];
      capturarBloqueios(tg, (d, x) => { const a = new HeuristicBot('teste', d.player).answer(d, x.game); respostas.push(a); return a; });
      tg.passTo('main2');
      expect(respostas).toHaveLength(1);
      expect(noCemiterio(tg, 0, 'Kami of Ancient Law')).toBe(true);
      expect(tg.life(1)).toBe(35);
    });
    it('para não morrer, bloqueia o atacante com ameaça com duas criaturas', () => {
      const tg = setup({ step: 'beginCombat', life: 5, battlefield: [['Defiling Daemogoth'], ['Kami of Ancient Law', 'Goblin Electromancer']] });
      tg.attack([['Defiling Daemogoth', 1]]);
      doBot(tg);
      dividirDano(tg, (d) => danoPadrao(d));
      tg.passTo('main2');
      expect(tg.life(1)).toBe(5);
      expect(tg.state.gameOver).toBeNull();
    });
    it('em quatro jogadores, cada bot só bloqueia quem ataca ele', () => {
      const tg = setup({ players: 4, step: 'beginCombat', battlefield: [['Kami of Ancient Law', 'Goblin Electromancer'], ['Indomitable Ancients'], ['Indomitable Ancients'], ['Indomitable Ancients']] });
      tg.attack([['Kami of Ancient Law', 1], ['Goblin Electromancer', 2]]);
      const respostas: [number, Answer][] = [];
      capturarBloqueios(tg, (d, x) => { const a = new HeuristicBot('teste', d.player).answer(d, x.game); respostas.push([d.player, a]); return a; });
      tg.passTo('main2');
      expect(respostas.map(([p]) => p)).toEqual([1, 2]);
      expect(noCemiterio(tg, 0, 'Kami of Ancient Law') && noCemiterio(tg, 0, 'Goblin Electromancer')).toBe(true);
    });
  });
});
