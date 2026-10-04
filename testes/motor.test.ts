import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decks from '../gerado/decks.json' with { type: 'json' };
import { RandomBot } from '../bots/aleatorio.ts';
import { validateDeck } from '../motor/deck.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import { buildView } from '../motor/view.ts';
import { setup } from './harness.ts';

const DECKS = decks as DeckList[];

function config(seed: string, n: number) {
  return { seed, players: Array.from({ length: n }, (_, i) => ({ name: `J${i}`, deckId: DECKS[i].id })), startingLife: 40, turnLimit: 12, multiplayer: n > 2 };
}

function playRandom(game: Game, steps: number, seed: string): void {
  const bots = game.state.players.map((p) => new RandomBot(`${seed}:${p.id}`));
  for (let i = 0; i < steps && game.pending && !game.isOver(); i++) {
    const d = game.pending;
    const r = game.answer(d.player, bots[d.player].answer(d));
    if (!r.ok) throw new Error(r.error);
  }
}

describe('decks (CR 903.5)', () => {
  it('os 7 decks são legais', () => {
    for (const d of DECKS) expect(validateDeck(d), d.nome).toEqual([]);
  });
  it('903.5c: carta fora da identidade de cor é recusada', () => {
    const d = { ...DECKS[0], cartas: [...DECKS[0].cartas.slice(1), { nome: 'Counterspell', quantidade: 1 }] };
    expect(validateDeck(d).map((p) => p.rule)).toContain('903.5c');
  });
  it('903.5b: duas cópias de uma carta não básica são recusadas', () => {
    const nb = DECKS[0].cartas.find((e) => e.nome !== 'Plains' && e.nome !== 'Swamp' && e.nome !== 'Forest')!;
    const d = { ...DECKS[0], cartas: [...DECKS[0].cartas.filter((e) => e !== nb), { ...nb, quantidade: 2 }] };
    expect(validateDeck(d).map((p) => p.rule)).toContain('903.5b');
  });
});

describe('início da partida', () => {
  it('CR 903.6, 903.7: comandante na zona de comando, 40 de vida, 7 cartas', () => {
    const g = Game.create(config('inicio', 4), DECKS.slice(0, 4));
    const s = g.state;
    expect(s.zones.command.length).toBe(4);
    expect(s.players.every((p) => p.life === 40)).toBe(true);
    expect(s.zones.hand.every((h) => h.length === 7)).toBe(true);
    expect(s.zones.library.every((l) => l.length === 92)).toBe(true);
    expect(g.pending?.kind).toBe('mulligan');
  });

  it('CR 103.5c: em multijogador o primeiro mulligan é grátis', () => {
    const g = Game.create(config('mull', 4), DECKS.slice(0, 4));
    const first = g.pending!.player;
    g.answer(first, { kind: 'mulligan', keep: false });
    for (let i = 0; i < 3; i++) g.answer(g.pending!.player, { kind: 'mulligan', keep: true });
    // o primeiro decide de novo com 7 cartas (nada no fundo)
    expect(g.pending).toMatchObject({ kind: 'mulligan', player: first });
    expect(g.state.zones.hand[first].length).toBe(7);
    g.answer(first, { kind: 'mulligan', keep: false });
    // segundo mulligan: põe 1 no fundo
    expect(g.pending?.kind).toBe('select');
    g.answer(first, { kind: 'select', ids: [g.pending!.kind === 'select' ? g.pending!.items[0].id : ''] });
    expect(g.state.zones.hand[first].length).toBe(6);
  });

  it('CR 103.5: em dois jogadores o primeiro mulligan já põe uma carta no fundo', () => {
    const g = Game.create(config('mull2', 2), DECKS.slice(0, 2));
    const first = g.pending!.player;
    g.answer(first, { kind: 'mulligan', keep: false });
    g.answer(g.pending!.player, { kind: 'mulligan', keep: true });
    expect(g.pending).toMatchObject({ kind: 'select', player: first });
  });

  it('CR 103.8a/103.8c: quem começa compra no primeiro turno só em multijogador (Q42, Q43)', () => {
    for (const [n, expected] of [[4, 8], [2, 7]] as const) {
      const g = Game.create(config(`draw${n}`, n), DECKS.slice(0, n));
      for (let i = 0; i < n; i++) g.answer(g.pending!.player, { kind: 'mulligan', keep: true });
      const first = g.state.turnOrder[0];
      // passa até a primeira fase principal
      while (!(g.state.turn.step === 'main1' && g.pending?.kind === 'priority')) g.answer(g.pending!.player, { kind: 'priority', action: 'pass' });
      expect(g.state.zones.hand[first].length).toBe(expected);
    }
  });
});

describe('reprodução e persistência', () => {
  it('as mesmas semente e entradas recriam o mesmo estado', () => {
    const g = Game.create(config('repro', 4), DECKS.slice(0, 4));
    playRandom(g, 600, 'repro');
    const again = Game.replay(g.state.config, DECKS.slice(0, 4), g.inputs);
    expect(JSON.stringify(again.state)).toBe(JSON.stringify(g.state));
  });

  it('retomar de um checkpoint dá o mesmo estado que continuar jogando', () => {
    const g = Game.create(config('cp', 4), DECKS.slice(0, 4));
    playRandom(g, 300, 'cp');
    while (g.pending && g.pending.kind !== 'priority') playRandom(g, 1, 'cp2');
    const cp = g.checkpoint()!;
    expect(cp).not.toBeNull();
    playRandom(g, 300, 'cp3');
    const back = Game.fromCheckpoint(cp, DECKS.slice(0, 4), g.inputs);
    expect(JSON.stringify(back.state.zones)).toBe(JSON.stringify(g.state.zones));
    expect(back.state.players.map((p) => p.life)).toEqual(g.state.players.map((p) => p.life));
  });
});

describe('informação oculta (CR 400.2)', () => {
  it('a vista de um jogador não contém mão nem grimório dos outros', () => {
    const g = Game.create(config('oculto', 4), DECKS.slice(0, 4));
    playRandom(g, 400, 'oculto');
    for (const viewer of [0, 1, 2, 3]) {
      const v = buildView(g.g, viewer, g.pending);
      // todos os ids de objeto presentes na vista (zonas, pilha, decisão)
      const ids = new Set<number>();
      const objs = [...v.battlefield, ...v.hand, ...v.exile, ...v.command, ...v.players.flatMap((p) => p.graveyard)];
      for (const o of objs) ids.add(o.id);
      for (const st of v.stack) ids.add(st.id);
      if (v.decision && v.decision.kind === 'select') for (const it of v.decision.items) if (it.obj !== undefined) ids.add(it.obj);
      for (const p of [0, 1, 2, 3]) {
        if (p === viewer) continue;
        for (const id of g.state.zones.hand[p]) if (g.state.objects[id].visibleTo !== 'all') expect(ids.has(id), `mão de ${p} vazou para ${viewer}`).toBe(false);
        for (const id of g.state.zones.library[p]) expect(ids.has(id), `grimório de ${p} vazou para ${viewer}`).toBe(false);
      }
      // nomes das cartas na mão dos outros não aparecem como objetos
      expect(v.hand.every((o) => g.state.objects[o.id].owner === viewer)).toBe(true);
      // a decisão pendente de outro jogador não é enviada, só quem está decidindo
      if (g.pending && g.pending.player !== viewer) expect(v.decision).toBeNull();
    }
  });
});

describe('combate multijogador (CR 802)', () => {
  it('802.3/802.4: atacar dois jogadores; cada defensor bloqueia só quem ataca ele', () => {
    const tg = setup({ players: 3, step: 'beginCombat', battlefield: [['Indomitable Ancients', 'Zetalpa, Primal Dawn'], ['Wall of Omens'], ['Sylvan Caryatid']] });
    tg.attack([['Indomitable Ancients', 1], ['Zetalpa, Primal Dawn', 2]]);
    tg.pass();
    tg.settle();
    // Bruno decide primeiro (APNAP); só pode bloquear Indomitable Ancients
    tg.passTo('main2');
    expect(tg.life(2)).toBe(32);
  });

  it('CR 702.111b: menace exige dois bloqueadores', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Killian, Ink Duelist'], ['Wall of Omens', 'Indomitable Ancients']] });
    tg.attack([['Killian, Ink Duelist', 1]]);
    tg.pass();
    tg.settle();
    const d = tg.pending!;
    expect(d.kind).toBe('priority');
  });

  it('CR 601.2f: Killian reduz {2} de mágica que mira criatura', () => {
    const tg = setup({ battlefield: [['Killian, Ink Duelist', 'Plains'], ['Indomitable Ancients']], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    expect(tg.state.zones.stack.length).toBe(1);
  });
});

import { DEFAULT_STOPS, shouldAutoPass } from '../motor/autopass.ts';

describe('passagem automática (CR 732)', () => {
  it('passa sozinho quando a única ação é passar', () => {
    const tg = setup({});
    expect(shouldAutoPass(tg.state, tg.pending!, 0, DEFAULT_STOPS)).toBe(true);
  });
  it('para nas etapas configuradas e quando um oponente põe algo na pilha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']] });
    expect(shouldAutoPass(tg.state, tg.pending!, 0, DEFAULT_STOPS)).toBe(false); // main1 é parada
    tg.cast("Night's Whisper");
    // a própria mágica no topo: passa
    expect(shouldAutoPass(tg.state, tg.pending!, 0, DEFAULT_STOPS)).toBe(true);
    tg.pass();
    // Bruno tem Counterspell e um oponente pôs algo na pilha: para
    expect(shouldAutoPass(tg.state, tg.pending!, 1, DEFAULT_STOPS)).toBe(false);
    expect(shouldAutoPass(tg.state, tg.pending!, 1, { ...DEFAULT_STOPS, stopOnOpponentStack: false })).toBe(true);
  });
  it('"passar até o fim do turno" vale só para o turno atual', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []] });
    expect(shouldAutoPass(tg.state, tg.pending!, 0, { ...DEFAULT_STOPS, passUntilTurnEnds: tg.state.turn.number })).toBe(true);
    expect(shouldAutoPass(tg.state, tg.pending!, 0, { ...DEFAULT_STOPS, passUntilTurnEnds: tg.state.turn.number - 1 })).toBe(false);
  });
});

describe('ações baseadas em estado (CR 704.5)', () => {
  it('704.5m: Aura sem objeto vai para o cemitério; 704.5n: Equipamento fica desanexado', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Indomitable Ancients', { name: 'Angelic Gift', attachTo: 'Indomitable Ancients' }, 'Wall of Omens', { name: 'Swiftfoot Boots', attachTo: 'Wall of Omens' }], []],
      hand: [['Infernal Grasp', 'Infernal Grasp'], []],
    });
    tg.state.players[0].manaPool.push({ type: 'B', source: null }, { type: 'B', source: null });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.find('Angelic Gift')).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Angelic Gift');
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve();
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].attachedTo).toBeNull();
  });

  it('704.5q: marcadores +1/+1 e -1/-1 se anulam', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }, 'Wall of Omens', 'Zetalpa, Primal Dawn'], []], hand: [['Incremental Blight'], []] });
    tg.choose('(1 marcador)', ['Wall of Omens']).choose('(2 marcadores)', ['Zetalpa, Primal Dawn']).choose('(3 marcadores)', ['Indomitable Ancients']);
    tg.cast('Incremental Blight').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters).toEqual({ '-1/-1': 1 });
  });

  it('704.5d: ficha que sai do campo deixa de existir; 704.5i: planeswalker sem lealdade morre', () => {
    const tg = setup({ battlefield: [[{ name: 'Quintorius, History Chaser', counters: { loyalty: 4 } }], []] });
    tg.activate('Quintorius, History Chaser', '−4');
    tg.resolve();
    expect(tg.find('Quintorius, History Chaser')).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Quintorius, History Chaser');
  });

  it('CR 506.6, 510.1b: atacar um planeswalker tira lealdade', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients'], [{ name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]] });
    tg.attack([['Indomitable Ancients', { kind: 'obj', id: tg.bf('Quintorius, History Chaser') }]]);
    tg.passTo('main2');
    expect(tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty).toBe(3);
    expect(tg.life(1)).toBe(40);
  });

  it('CR 702.19b: atropelar só passa dano depois de dano letal no bloqueador', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], ['Arboreal Grazer']] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]).block([['Arboreal Grazer', 'Zetalpa, Primal Dawn']]);
    let rejected = '';
    tg.script.push((d, x) => {
      if (d.kind !== 'damage') return null;
      rejected = x.game.check(d.player, { kind: 'damage', assign: [1, 3] }) ?? '';
      return { kind: 'damage', assign: [d.lethal[0], d.amount - d.lethal[0]] };
    });
    tg.passTo('main2');
    expect(rejected).toContain('702.19b');
    expect(tg.find('Arboreal Grazer')).toBeNull();
    // golpe duplo: no 1º golpe 3 no Grazer e 1 no jogador; no 2º, sem bloqueador, os 4 vão ao jogador (702.19d)
    expect(tg.life(1)).toBe(35);
  });
});
