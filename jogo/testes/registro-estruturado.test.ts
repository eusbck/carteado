// F3 (estudo do Arena, registro R1): linhas do registro com tipo, autor, refs e pedaços.
//  - o helper `reg` monta o mesmo texto de antes e guarda parts/refs/actor;
//  - as linhas migradas do núcleo (turno, terreno, conjurar, ataque, bloqueio, dano, fim) saem com o kind certo;
//  - a vista redige por espectador: quem recebe o hiddenText fica sem refs; a carta que ele não via vai sem id; a
//    virada para baixo citada numa linha pública não entrega a def; o CardId nunca sai.
import { describe, expect, it } from 'vitest';
import { jog, lista, obj, objs, reg, trecho } from '../motor/registro.ts';
import type { LogEntry } from '../motor/types.ts';
import { buildView, type LogLinhaView } from '../motor/view.ts';
import { setup, type TestGame } from './harness.ts';
import decks from './decks-teste.json' with { type: 'json' };
import { RandomBot } from '../bots/aleatorio.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';

const ultima = (tg: TestGame): LogEntry => tg.state.log[tg.state.log.length - 1];
const linhas = (tg: TestGame, kind: string): LogEntry[] => tg.state.log.filter((e) => e.kind === kind);
/** a linha da vista com o mesmo seq de `e` */
const naVista = (tg: TestGame, viewer: number | null, e: LogEntry): LogLinhaView | undefined => buildView(tg.g, viewer, null).log.find((l) => l.seq === e.seq);

describe('registro estruturado: helper reg', () => {
  it('monta o texto igual ao de antes, com parts, refs e actor', () => {
    const tg = setup({ battlefield: [['Kami of Ancient Law', 'Relic Retriever'], []] });
    const [kami, relic] = [tg.bf('Kami of Ancient Law'), tg.bf('Relic Retriever')];
    reg(tg.g, 'conjura', { rule: '601.2' })`${jog(0)} conjura ${obj(kami, 'fonte')} (alvos: ${lista([jog(1, 'alvo'), obj(relic, 'alvo')])}).`;
    const e = ultima(tg);
    expect(e.text).toBe('Ana conjura Kami of Ancient Law (alvos: Bruno, Relic Retriever).');
    expect(e).toMatchObject({ kind: 'conjura', actor: 0, rule: '601.2', seq: tg.state.log.length - 1, step: 'main1' });
    expect(e.parts).toEqual([{ ref: 0 }, ' conjura ', { ref: 1 }, ' (alvos: ', { ref: 2 }, ', ', { ref: 3 }, ').']);
    expect(e.refs).toEqual([
      { k: 'jogador', id: 0 },
      { k: 'obj', id: kami, card: tg.state.objects[kami].card, name: 'Kami of Ancient Law', papel: 'fonte', vis: null },
      { k: 'jogador', id: 1, papel: 'alvo' },
      { k: 'obj', id: relic, card: tg.state.objects[relic].card, name: 'Relic Retriever', papel: 'alvo', vis: null },
    ]);
  });

  it('sem jogador no começo, o actor é null (ou o que vier nas opções); listas, trechos e nome trocado', () => {
    const tg = setup({ battlefield: [['Kami of Ancient Law', 'Relic Retriever'], []] });
    const [kami, relic] = [tg.bf('Kami of Ancient Law'), tg.bf('Relic Retriever')];
    reg(tg.g, 'zona')`${objs([kami, relic])} voltam.`;
    expect(ultima(tg)).toMatchObject({ text: 'Kami of Ancient Law, Relic Retriever voltam.', actor: null });
    reg(tg.g, 'bloqueio', { actor: 1 })`Bloqueios: ${lista([trecho`${obj(kami)} bloqueia ${obj(relic)}`, trecho`${obj(relic, undefined, 'Outro nome')} bloqueia ${obj(kami)}`], '; ')}.`;
    const e = ultima(tg);
    expect(e.text).toBe('Bloqueios: Kami of Ancient Law bloqueia Relic Retriever; Outro nome bloqueia Kami of Ancient Law.');
    expect(e.actor).toBe(1);
    expect(e.refs!.map((r) => r.k === 'obj' && r.name)).toEqual(['Kami of Ancient Law', 'Relic Retriever', 'Outro nome', 'Kami of Ancient Law']);
    // o texto se refaz juntando os pedaços
    expect(e.parts!.map((p) => (typeof p === 'string' ? p : (e.refs![p.ref] as { name: string }).name)).join('')).toBe(e.text);
    // lista vazia: o texto de `vazio`
    reg(tg.g, 'outro')`Nada: ${objs([], undefined, ', ', 'nenhuma')}.`;
    expect(ultima(tg).text).toBe('Nada: nenhuma.');
  });
});

describe('registro estruturado: linhas migradas do núcleo', () => {
  it('jogar terreno, conjurar com alvo e o turno seguinte', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [['Mountain', 'Lightning Bolt'], []] });
    tg.play('Mountain');
    const terreno = linhas(tg, 'terreno').at(-1)!;
    expect(terreno).toMatchObject({ text: 'Ana joga Mountain.', actor: 0, rule: '305.1' });
    expect(terreno.refs![1]).toMatchObject({ k: 'obj', name: 'Mountain', papel: 'fonte' });
    tg.choose('qualquer alvo', ['Indomitable Ancients']).cast('Lightning Bolt');
    const conj = linhas(tg, 'conjura').at(-1)!;
    expect(conj).toMatchObject({ text: 'Ana conjura Lightning Bolt (alvos: Indomitable Ancients).', actor: 0, rule: '601.2' });
    expect(conj.refs!.map((r) => r.papel)).toEqual([undefined, 'fonte', 'alvo']);
    tg.resolve();
    tg.passTo('upkeep', 1);
    const turno = linhas(tg, 'turno').at(-1)!;
    expect(turno).toMatchObject({ text: `Turno ${tg.state.turn.number}: Bruno.`, actor: 1, rule: '500.1' });
    expect(turno.step).toBeDefined();
  });

  it('ataque, bloqueio e dano de combate', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Relic Retriever'], ['Kami of Ancient Law']] });
    tg.attack([['Relic Retriever', 1]]).block([['Kami of Ancient Law', 'Relic Retriever']]);
    tg.passTo('main2');
    expect(linhas(tg, 'ataque').at(-1)).toMatchObject({ text: 'Ana ataca: Relic Retriever → Bruno.', actor: 0, step: 'declareAttackers' });
    const bl = linhas(tg, 'bloqueio').at(-1)!;
    expect(bl).toMatchObject({ text: 'Bloqueios: Kami of Ancient Law bloqueia Relic Retriever.', step: 'declareBlockers' });
    expect(bl.refs!.map((r) => r.papel)).toEqual(['fonte', 'alvo']);
    const danos = linhas(tg, 'dano');
    expect(danos.length).toBeGreaterThan(0);
    expect(danos[0].text).toMatch(/^Dano de combate: Relic Retriever causa \d+ a Kami of Ancient Law\.$/);
    expect(danos[0].refs!.map((r) => r.papel)).toEqual(['fonte', 'vitima']);
  });

  it('não atacar e conceder', async () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Relic Retriever'], []] });
    tg.attack([]);
    tg.passTo('main2');
    expect(linhas(tg, 'ataque').at(-1)).toMatchObject({ text: 'Ana não ataca.', actor: 0 });
    const { concede } = await import('../motor/turn.ts');
    concede(tg.g, 1);
    expect(linhas(tg, 'fim').map((e) => e.text)).toContain('Bruno concede a partida.');
    expect(linhas(tg, 'fim').find((e) => e.text === 'Bruno concede a partida.')!.actor).toBe(1);
  });
});

describe('registro estruturado: redação na vista', () => {
  it('carta virada para baixo conjurada: o oponente recebe só o hiddenText, sem refs nem parts', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Zoetic Cavern'], []] });
    tg.cast('Zoetic Cavern', 'morph');
    const e = linhas(tg, 'conjura').at(-1)!;
    expect(e.visibleTo).toEqual([0]);
    const dono = naVista(tg, 0, e)!;
    expect(dono.text).toBe(e.text);
    expect(dono.refs![1]).toMatchObject({ k: 'obj', def: 'Zoetic Cavern' });
    expect(dono.refs![1]).toHaveProperty('id');
    const outro = naVista(tg, 1, e)!;
    expect(outro).toMatchObject({ text: 'Ana conjura uma criatura virada para baixo.', kind: 'conjura', actor: 0 });
    expect(outro.refs).toBeUndefined();
    expect(outro.parts).toBeUndefined();
    expect(JSON.stringify(buildView(tg.g, 1, null).log)).not.toContain('Zoetic');
  });

  it('virada para baixo citada numa linha pública: quem não a vê não recebe a def nem o id', () => {
    const tg = setup({ battlefield: [['Zoetic Cavern'], []] });
    const id = tg.bf('Zoetic Cavern');
    tg.state.objects[id].faceDown = true;
    tg.g.bump();
    reg(tg.g, 'dano')`Dano de combate: ${obj(id, 'fonte')} causa 2 a ${jog(1, 'vitima')}.`;
    const e = ultima(tg);
    expect(e.text).toBe('Dano de combate: carta virada para baixo causa 2 a Bruno.');
    expect(naVista(tg, 0, e)!.refs![0]).toMatchObject({ id, def: 'Zoetic Cavern' });
    const outro = naVista(tg, 1, e)!.refs![0];
    expect(outro).toEqual({ k: 'obj', def: null, name: 'carta virada para baixo', papel: 'fonte' });
    expect(JSON.stringify(buildView(tg.g, 1, null).log)).not.toContain('Zoetic');
  });

  it('carta revelada da mão: a ref vai sem id para quem não via a carta', () => {
    const tg = setup({ hand: [['Lightning Bolt'], []] });
    const id = tg.state.zones.hand[0][0];
    reg(tg.g, 'revela')`${jog(0)} revela ${obj(id)}.`;
    const e = ultima(tg);
    expect(e.refs![1]).toMatchObject({ vis: [0] });
    expect(naVista(tg, 0, e)!.refs![1]).toEqual({ k: 'obj', id, def: 'Lightning Bolt', name: 'Lightning Bolt' });
    // o nome já está no texto, então a def vai; o id (que permitiria seguir a carta) não
    expect(naVista(tg, 1, e)!.refs![1]).toEqual({ k: 'obj', def: 'Lightning Bolt', name: 'Lightning Bolt' });
    expect(naVista(tg, null, e)!.refs![1]).not.toHaveProperty('id');
  });

  it('o CardId nunca sai na vista; linhas antigas (só texto) continuam', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [['Mountain', 'Lightning Bolt'], []] });
    tg.play('Mountain');
    tg.choose('qualquer alvo', ['Indomitable Ancients']).cast('Lightning Bolt').resolve();
    tg.g.log('Linha antiga, só texto.');
    // linha de checkpoint antigo: sem seq/step
    tg.state.log.push({ turn: 1, text: 'Bem antiga.', visibleTo: null });
    for (const viewer of [0, 1, null]) {
      const log = buildView(tg.g, viewer, null).log;
      for (const l of log) {
        for (const r of l.refs ?? []) {
          expect(r).not.toHaveProperty('card');
          expect(r).not.toHaveProperty('vis');
          expect(Object.keys(r).every((k) => ['k', 'id', 'def', 'name', 'papel'].includes(k))).toBe(true);
        }
      }
      expect(JSON.stringify(log)).not.toMatch(/"card"/);
      const antiga = log.find((l) => l.text === 'Linha antiga, só texto.')!;
      expect(antiga.kind).toBeUndefined();
      expect(antiga.refs).toBeUndefined();
      const bem = log.at(-1)!;
      expect(bem).toMatchObject({ text: 'Bem antiga.', seq: tg.state.log.length - 1, turn: 1 });
      // os seq são únicos
      expect(new Set(log.map((l) => l.seq)).size).toBe(log.length);
    }
  });
});

describe('registro estruturado: entrada (elo com o replay)', () => {
  const DECKS = decks as DeckList[];
  const config = (seed: string) => ({ seed, players: [0, 1].map((i) => ({ name: `J${i}`, deckId: DECKS[i].id })), startingLife: 40, turnLimit: 6, multiplayer: false });
  const jogar = (game: Game, passos: number) => {
    const bots = game.state.players.map((p) => new RandomBot(`entrada:${p.id}`));
    for (let i = 0; i < passos && game.pending && !game.isOver(); i++) {
      const d = game.pending;
      const r = game.answer(d.player, bots[d.player].answer(d));
      if (!r.ok) throw new Error(r.error);
    }
  };
  const numeros = (game: Game) => game.state.log.map((e) => e.entrada);

  it('cada linha guarda o índice da entrada que a gerou; replay e checkpoint refazem os mesmos números', () => {
    const game = Game.create(config('entrada'), DECKS.slice(0, 2));
    jogar(game, 120);
    const ns = numeros(game);
    expect(ns.every((n) => typeof n === 'number')).toBe(true);
    // não decrescem e nunca passam do número de entradas aplicadas
    expect(ns.every((n, i) => i === 0 || n! >= ns[i - 1]!)).toBe(true);
    expect(Math.max(...(ns as number[]))).toBeLessThanOrEqual(game.inputs.length);
    // as linhas antes da primeira resposta (ordem dos assentos) são da entrada 0
    expect(ns[0]).toBe(0);
    // a vista leva o número para todos
    const v = buildView(game.g, 1, null);
    for (const l of v.log) expect(l.entrada).toBe(game.state.log[l.seq].entrada);
    // replay
    expect(numeros(Game.replay(game.state.config, DECKS.slice(0, 2), game.inputs))).toEqual(ns);
    // checkpoint no meio + entradas seguintes
    let cp = null;
    for (let k = 40; k < game.inputs.length && !cp; k++) cp = Game.replay(game.state.config, DECKS.slice(0, 2), game.inputs.slice(0, k)).checkpoint();
    expect(cp).not.toBeNull();
    const retomada = Game.fromCheckpoint(cp!, DECKS.slice(0, 2), game.inputs);
    expect(numeros(retomada)).toEqual(ns);
    expect(numeros(Game.replayAteFalhar(game.state.config, DECKS.slice(0, 2), game.inputs, cp).game)).toEqual(ns);
    // fork de um checkpoint continua a contagem
    const f = game.fork();
    const antes = f.state.log.length;
    jogar(f, 5);
    expect(f.state.log.slice(antes).every((e) => e.entrada! >= game.inputs.length)).toBe(true);
  });
});
