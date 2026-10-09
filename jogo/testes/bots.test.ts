// Bot heurístico: decisões básicas em situações montadas (terreno, remoção, ataque, bloqueio, escolhas forçadas).
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { escolher, ficaComMao, HeuristicBot } from '../bots/heuristico.ts';
import { avaliar } from '../bots/avaliacao.ts';
import { determinizar } from '../bots/simulacao.ts';
import { seedFrom } from '../motor/rng.ts';
import type { Answer, Decision } from '../motor/types.ts';

/** o bot responde por `eu`; os outros passam ou usam a resposta padrão, até `parar` valer ou acabar o limite */
function jogar(tg: TestGame, bot: HeuristicBot, parar: (tg: TestGame) => boolean, limite = 300): void {
  for (let i = 0; i < limite && tg.pending && !tg.game.isOver(); i++) {
    if (parar(tg)) return;
    const d = tg.pending;
    const a = d.player === bot.eu ? bot.answer(d, tg.game) : tg.respond(d);
    const r = tg.game.answer(d.player, a);
    if (!r.ok) throw new Error(`resposta recusada: ${r.error}`);
  }
}

describe('bot heurístico', () => {
  it('joga o terreno da mão na fase principal', () => {
    const tg = setup({ hand: [['Forest', 'Island'], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 8 });
    const a = bot.answer(tg.pending!, tg.game);
    expect(a.kind === 'priority' && a.action.startsWith('play:')).toBe(true);
  });

  it('usa a remoção na criatura do oponente, não na própria', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Elvish Mystic'], ['Glissa Sunslayer']], hand: [['Abrade'], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 12 });
    jogar(tg, bot, (x) => x.state.zones.hand[0].length === 0 && x.state.zones.stack.length === 0);
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });

  it('bloqueia quando o ataque seria letal', () => {
    const tg = setup({ active: 1, battlefield: [['Wall of Omens'], [{ name: 'Gau, Feral Youth', ready: true }]], library: [['Plains'], ['Plains']] });
    tg.state.players[0].life = 3;
    tg.refresh().attack([['Gau, Feral Youth', 0]]);
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2');
    expect(tg.life(0)).toBe(3);
  });

  it('ataca quando é seguro e não ataca para morrer', () => {
    const seguro = setup({ battlefield: [[{ name: 'Gau, Feral Youth', ready: true }], []], library: [['Plains'], ['Plains']] });
    const b1 = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(seguro, b1, (x) => x.state.turn.step === 'main2');
    expect(seguro.life(1)).toBeLessThan(40);
    const perigo = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: true }], ['Glissa Sunslayer']], library: [['Plains'], ['Plains']] });
    const b2 = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(perigo, b2, (x) => x.state.turn.step === 'main2');
    expect(perigo.find('Elvish Mystic')).not.toBeNull();
    expect(perigo.life(1)).toBe(40);
  });

  it('num sacrifício forçado, entrega o que vale menos', () => {
    const tg = setup({ active: 1, battlefield: [['Glissa Sunslayer', 'Elvish Mystic'], ['Swamp', 'Swamp', 'Swamp']], hand: [[], ['Fleshbag Marauder']], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    tg.script.push((d, x) => (d.player === 0 && d.kind === 'select' ? bot.answer(d, x.game) : null));
    tg.cast('Fleshbag Marauder').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
  });

  it('não insiste em atacar quem cobra para ser atacado (Ghostly Prison) sem mana para pagar', () => {
    const tg = setup({ battlefield: [[{ name: 'Gau, Feral Youth', ready: true }], ['Ghostly Prison']], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2', 60);
    expect(tg.state.turn.step).toBe('main2');
    expect(tg.life(1)).toBe(40);
  });

  it('ataca com tudo quando o dano passa da vida do oponente mesmo com os bloqueios', () => {
    const tg = setup({ battlefield: [[...Array(6).fill({ name: 'Elvish Mystic', ready: true })], ['Glissa Sunslayer']], library: [['Plains'], ['Plains']] });
    tg.state.players[1].life = 4;
    tg.refresh();
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2' || x.game.isOver(), 200);
    expect(tg.game.isOver()).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('a determinização não muda a própria mão nem as quantidades escondidas', () => {
    const tg = setup({ hand: [['Forest', 'Island'], ['Plains', 'Swamp', 'Mountain']], library: [['Plains', 'Plains'], ['Island', 'Island', 'Forest']] });
    const f = determinizar(tg.game, 0, seedFrom('d'));
    expect(f.state.zones.hand[0]).toEqual(tg.state.zones.hand[0]);
    expect(f.state.zones.hand[1].length).toBe(3);
    expect(f.state.zones.library[1].length).toBe(3);
    const todas = (s: typeof tg.state) => [...s.zones.hand[1], ...s.zones.library[1]].sort();
    expect(todas(f.state)).toEqual(todas(tg.state));
    expect(avaliar(f.g, 0)).toBeCloseTo(avaliar(tg.g, 0));
  });

  it('ataca com criatura de força 0 quando Felothar faz o dano ser pela resistência', () => {
    const tg = setup({ battlefield: [[{ name: 'Felothar the Steadfast', ready: true }, { name: 'Nyx-Fleece Ram', ready: true }], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2');
    expect(tg.life(1)).toBe(30);
  });

  it('o ataque letal conta o dano de comandante (21), mesmo com pouca vida para segurar bloqueadores', () => {
    const tg = setup({ battlefield: [[{ name: 'Glissa Sunslayer', ready: true, commander: true }, { name: 'Elvish Mystic', ready: true }], []], library: [['Plains'], ['Plains']] });
    tg.state.players[0].life = 5;
    tg.state.players[1].commanderDamage[String(tg.state.objects[tg.bf('Glissa Sunslayer')].card)] = 18;
    tg.refresh();
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2' || x.game.isOver(), 200);
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('não gasta dano de combate em bloqueador que já tem dano letal', () => {
    const tg = setup({ battlefield: [['Glissa Sunslayer'], ['Elvish Mystic', 'Gau, Feral Youth']] });
    const [m, gau] = [tg.bf('Elvish Mystic'), tg.bf('Gau, Feral Youth')];
    const d: Decision = { kind: 'damage', id: 1, player: 0, prompt: 'Distribua 3 de dano', attacker: tg.bf('Glissa Sunslayer'), amount: 3, recipients: [{ kind: 'obj', id: m }, { kind: 'obj', id: gau }], lethal: [0, 3], trample: false };
    expect((escolher(d, tg.g, 0, seedFrom('d'), false) as Extract<Answer, { kind: 'damage' }>).assign).toEqual([0, 3]);
  });

  it('o X de uma habilidade (ciclagem do Shark Typhoon) é o maior que dá para pagar, não o teto de 20', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [['Shark Typhoon'], []], library: [['Plains', 'Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario' });
    let x = -1;
    tg.script.push((d, g) => {
      if (d.kind !== 'number' || d.player !== 0) return null;
      const a = bot.answer(d, g.game);
      if (a.kind === 'number') x = a.value;
      return a;
    });
    tg.activate('Shark Typhoon').resolveAll();
    expect(x).toBe(3);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });

  it('kicker só quando dá para pagar a mana dele junto com a da mágica', () => {
    const kicker = (terrenos: number): string[] => {
      const tg = setup({ battlefield: [Array(terrenos).fill('Island'), ['Gau, Feral Youth']], hand: [['Rite of Replication'], []], library: [['Plains'], ['Plains']] });
      const bot = new HeuristicBot('t', 0, { nivel: 'intermediario' });
      const resp: string[] = [];
      tg.script.push((d, g) => {
        if (d.kind !== 'select' || !d.prompt.endsWith('custo adicional opcional')) return null;
        const a = bot.answer(d, g.game);
        if (a.kind === 'select') resp.push(...a.ids);
        return a;
      });
      tg.choose('criatura alvo', ['Gau, Feral Youth']).cast('Rite of Replication');
      return resp;
    };
    expect(kicker(5)).toEqual(['no']);
    expect(kicker(9)).toEqual(['yes']);
  });

  for (const nivel of ['facil', 'intermediario'] as const) {
    it(`${nivel}: conjura Sol Ring e Signet quando tem a mana (deck do Jace)`, () => {
      const tg = setup({ battlefield: [['Island', 'Swamp', 'Plains'], ['Grave Titan']], hand: [['Sol Ring', 'Dimir Signet'], []], library: [['Plains'], ['Plains']] });
      const bot = new HeuristicBot('t', 0, { nivel, orcamento: 1e9 });
      jogar(tg, bot, (x) => x.state.turn.step === 'main2' || x.state.turn.active !== 0);
      expect(tg.find('Sol Ring')).not.toBeNull();
      expect(tg.find('Dimir Signet')).not.toBeNull();
    });
  }

  it('joga o terreno antes das mágicas', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [['Dimir Signet', 'Plains', 'Swords to Plowshares'], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario', orcamento: 1e9 });
    const a = bot.answer(tg.pending!, tg.game);
    expect(a.kind === 'priority' && a.action.startsWith('play:')).toBe(true);
  });

  it('mulligan: pedra de mana conta meio terreno, com pelo menos um terreno', () => {
    expect(ficaComMao(1, 2, 0)).toBe(true);
    expect(ficaComMao(1, 1, 0)).toBe(false);
    expect(ficaComMao(0, 4, 0)).toBe(false);
    expect(ficaComMao(2, 0, 0)).toBe(true);
    expect(ficaComMao(6, 0, 0)).toBe(false);
  });

  it('do Difícil em diante, guardar mana para a contramágica vale na avaliação', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Counterspell'], []] });
    const desvirado = avaliar(tg.g, 0, { papeis: true });
    for (const id of tg.state.zones.battlefield) tg.state.objects[id].tapped = true;
    const virado = avaliar(tg.g, 0, { papeis: true });
    expect(desvirado - virado).toBeGreaterThan(1.5);
  });
});
