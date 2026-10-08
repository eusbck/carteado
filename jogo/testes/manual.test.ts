// Modo manual: ajustes para aplicar à mão o efeito de cartas pendentes.
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { Game } from '../motor/game.ts';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import type { ManualAction } from '../motor/types.ts';

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
