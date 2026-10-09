// Modo manual: ajustes para aplicar à mão o efeito de cartas pendentes.
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { Game } from '../motor/game.ts';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import type { ManualAction, ObjId } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';

function manual(tg: TestGame, m: ManualAction): string | null {
  const p = tg.pending!.player;
  const a = { kind: 'priority' as const, action: 'manual', manual: m };
  const err = tg.game.check(p, a);
  if (err) return err;
  tg.answer(a);
  tg.settle();
  return null;
}

function comManual(opts: Parameters<typeof setup>[0]): TestGame {
  const tg = setup(opts);
  tg.state.config.manualMode = true;
  return tg.refresh();
}

describe('Modo manual', () => {
  it('sem o modo ligado, não há ajuste manual', () => {
    const tg = setup({ battlefield: [['Plains'], []] });
    expect(tg.pending!.kind === 'priority' && tg.pending!.actions.some((a) => a.kind === 'manual')).toBe(false);
  });
  it('mover um permanente para o cemitério dispara os gatilhos de morrer e fica no log', () => {
    const tg = comManual({ battlefield: [['Zulaport Cutthroat', 'Elvish Mystic'], []] });
    expect(manual(tg, { k: 'mover', obj: tg.bf('Elvish Mystic'), to: 'graveyard' })).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.state.log.some((l) => l.text.includes('(ajuste manual) move Elvish Mystic do campo para o cemitério'))).toBe(true);
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('vida, marcadores, virar e fichas', () => {
    const tg = comManual({ battlefield: [['Wall of Omens'], []] });
    expect(manual(tg, { k: 'vida', player: 1, delta: -3 })).toBeNull();
    expect(manual(tg, { k: 'marcadores', target: { kind: 'obj', id: tg.bf('Wall of Omens') }, kind: '+1/+1', delta: 2 })).toBeNull();
    expect(manual(tg, { k: 'virar', obj: tg.bf('Wall of Omens'), tapped: true })).toBeNull();
    expect(manual(tg, { k: 'ficha', def: 'Saproling', n: 2, player: 0 })).toBeNull();
    expect(tg.life(1)).toBe(37);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.all('Saproling').length).toBe(2);
    expect(tg.pending!.player).toBe(0); // CR 117.3c: quem agiu mantém a prioridade
  });
  it('CR 401.2 e 402.3: não mexe na mão nem no grimório de outro jogador', () => {
    const tg = comManual({ battlefield: [[], []], hand: [[], ['Counterspell']], library: [[], ['Island']] });
    expect(manual(tg, { k: 'mover', obj: tg.find('Counterspell', 'hand', 1)!, to: 'graveyard' })).not.toBeNull();
    expect(manual(tg, { k: 'mover', obj: tg.state.zones.library[1][0], to: 'graveyard' })).not.toBeNull();
    expect(manual(tg, { k: 'vida', player: 1, delta: 0 })).not.toBeNull();
  });
  it('buscar no próprio grimório: escolhe a carta e embaralha', () => {
    const tg = comManual({ battlefield: [[], []], library: [['Island', 'Zetalpa, Primal Dawn', 'Plains'], []] });
    tg.choose('Procure uma carta', ['Zetalpa, Primal Dawn']);
    expect(manual(tg, { k: 'buscar', to: 'hand' })).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
  });
  it('as entradas manuais reproduzem a mesma partida a partir da semente', () => {
    const decks = decksJson as DeckList[];
    const config = { seed: 'manual-1', players: [{ name: 'Ana', deckId: decks[0].id }, { name: 'Bruno', deckId: decks[1].id }], startingLife: 40, turnLimit: null, multiplayer: false, manualMode: true };
    const game = Game.create(config, [decks[0], decks[1]]);
    for (let i = 0; i < 200 && game.pending && game.pending.kind !== 'priority'; i++) game.answer(game.pending.player, { kind: 'mulligan', keep: true });
    const p = game.pending!.player;
    expect(game.answer(p, { kind: 'priority', action: 'manual', manual: { k: 'vida', player: 1 - p, delta: -5 } }).ok).toBe(true);
    expect(game.answer(game.pending!.player, { kind: 'priority', action: 'manual', manual: { k: 'comprar', n: 2 } }).ok).toBe(true);
    const copia = Game.replay(config, [decks[0], decks[1]], game.inputs);
    expect(JSON.stringify(copia.state)).toBe(JSON.stringify(game.state));
    expect(copia.state.players[1 - p].life).toBe(35);
  });
});

// desvirar à mão desfaz o virar para mana: a mana da permanente que ainda está na reserva sai junto
describe('Modo manual: desvirar devolve a mana da reserva', () => {
  const reserva = (tg: TestGame, p = 0) => tg.state.players[p].manaPool.map((u) => u.type).join('');
  const virarParaMana = (tg: TestGame, obj: ObjId) => {
    const a = tg.actionIds().find((id) => id.startsWith('mana:') && id.split(':')[1].startsWith(`${obj}|`));
    expect(a, `habilidade de mana de ${obj}`).toBeDefined();
    tg.answer({ kind: 'priority', action: a! });
    tg.settle();
  };
  const ultimaLinha = (tg: TestGame) => tg.state.log[tg.state.log.length - 1].text;

  it('virar uma terra para mana e desvirar à mão: a mana dela sai, a de outra terra fica', () => {
    const tg = comManual({ battlefield: [['Forest', 'Island'], []] });
    const forest = tg.bf('Forest'), island = tg.bf('Island');
    virarParaMana(tg, forest);
    virarParaMana(tg, island);
    expect(reserva(tg)).toBe('GU');
    // a vista mostra de onde veio cada unidade (o cliente usa para o clique que desvira)
    expect(buildView(tg.g, 0, tg.pending).players[0].manaSources).toEqual([forest, island]);
    expect(manual(tg, { k: 'virar', obj: forest, tapped: false })).toBeNull();
    expect(tg.state.objects[forest].tapped).toBe(false);
    expect(tg.state.objects[island].tapped).toBe(true);
    expect(reserva(tg)).toBe('U');
    expect(ultimaLinha(tg)).toBe('Ana (ajuste manual) desvira Forest (a mana dela, {G}, sai da reserva).');
    expect(buildView(tg.g, 0, tg.pending).players[0].manaSources).toEqual([island]);
    // a terra desvirada pode ser virada de novo para mana
    virarParaMana(tg, forest);
    expect(reserva(tg)).toBe('UG');
    expect(tg.pending!.player).toBe(0);
  });

  it('quando outro jogador desvira a sua terra, a terra desvira mas a sua mana fica', () => {
    const tg = comManual({ battlefield: [['Forest'], []] });
    const forest = tg.bf('Forest');
    virarParaMana(tg, forest);
    expect(reserva(tg)).toBe('G');
    // Ana passa a prioridade com a mana na reserva; na mesma etapa, Bruno desvira a Forest dela à mão
    tg.answer({ kind: 'priority', action: 'pass' });
    tg.settle();
    expect(tg.pending!.player).toBe(1);
    expect(manual(tg, { k: 'virar', obj: forest, tapped: false })).toBeNull();
    expect(tg.state.objects[forest].tapped).toBe(false);
    expect(reserva(tg)).toBe('G');
    expect(ultimaLinha(tg)).toBe('Bruno (ajuste manual) desvira Forest.');
  });

  it('mana já gasta não volta: só sai o que sobrou dela na reserva', () => {
    const tg = comManual({ battlefield: [['Sol Ring', 'Forest'], []], hand: [['Elvish Mystic', 'Sol Ring'], []] });
    const ring = tg.bf('Sol Ring'), forest = tg.bf('Forest');
    virarParaMana(tg, forest);
    tg.cast('Elvish Mystic'); // paga {G} com a mana da Forest
    expect(reserva(tg)).toBe('');
    tg.resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(manual(tg, { k: 'virar', obj: forest, tapped: false })).toBeNull();
    expect(tg.state.objects[forest].tapped).toBe(false);
    expect(reserva(tg)).toBe('');
    expect(ultimaLinha(tg)).toBe('Ana (ajuste manual) desvira Forest.');
    // Sol Ring dá {C}{C}; o segundo Sol Ring gasta um, e desvirar tira só o que sobrou
    virarParaMana(tg, ring);
    tg.cast('Sol Ring');
    expect(reserva(tg)).toBe('C');
    expect(manual(tg, { k: 'virar', obj: ring, tapped: false })).toBeNull();
    expect(reserva(tg)).toBe('');
    expect(ultimaLinha(tg)).toBe('Ana (ajuste manual) desvira Sol Ring (a mana dela, {C}, sai da reserva).');
    tg.resolveAll();
    expect(tg.all('Sol Ring').length).toBe(2);
  });

  it('desvirar uma permanente que não gerou mana não mexe na reserva', () => {
    const tg = comManual({ battlefield: [['Forest', { name: 'Plains', tapped: true }, 'Wall of Omens'], []] });
    virarParaMana(tg, tg.bf('Forest'));
    expect(manual(tg, { k: 'virar', obj: tg.bf('Plains'), tapped: false })).toBeNull();
    expect(manual(tg, { k: 'virar', obj: tg.bf('Wall of Omens'), tapped: true })).toBeNull();
    expect(manual(tg, { k: 'virar', obj: tg.bf('Wall of Omens'), tapped: false })).toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    expect(reserva(tg)).toBe('G');
    // desvirar o que já está desvirado também não tira a mana
    const tg2 = comManual({ battlefield: [['Sol Ring'], []] });
    virarParaMana(tg2, tg2.bf('Sol Ring'));
    expect(manual(tg2, { k: 'virar', obj: tg2.bf('Sol Ring'), tapped: true })).toBeNull();
    expect(reserva(tg2)).toBe('CC');
  });

  it('CR 122.1d: com marcador de atordoamento a terra não desvira e a mana fica', () => {
    const tg = comManual({ battlefield: [['Forest'], []] });
    const forest = tg.bf('Forest');
    virarParaMana(tg, forest);
    expect(manual(tg, { k: 'marcadores', target: { kind: 'obj', id: forest }, kind: 'stun', delta: 1 })).toBeNull();
    expect(manual(tg, { k: 'virar', obj: forest, tapped: false })).toBeNull();
    expect(tg.state.objects[forest].tapped).toBe(true);
    expect(tg.state.objects[forest].counters.stun ?? 0).toBe(0);
    expect(reserva(tg)).toBe('G');
  });

  it('a etapa de desvirar continua normal (não é ajuste manual)', () => {
    const tg = comManual({ battlefield: [['Forest'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    const forest = tg.bf('Forest');
    virarParaMana(tg, forest);
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 0);
    expect(tg.state.objects[forest].tapped).toBe(false);
    expect(tg.state.log.some((l) => l.text.includes('sai da reserva'))).toBe(false);
  });
});
