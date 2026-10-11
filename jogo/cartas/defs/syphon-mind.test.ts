import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const S = 'Syphon Mind';
const pantanos = Array(4).fill('Swamp');

describe(S, () => {
  it('cada outro jogador descarta uma carta; você compra uma por carta descartada', () => {
    const tg = setup({
      players: 4,
      battlefield: [pantanos, [], [], []],
      hand: [[S, 'Plains'], ['Forest', 'Island'], ['Mountain'], []],
      library: [['Wall of Omens', 'Sol Ring', 'Mind Stone', 'Swamp'], [], [], []],
    });
    tg.choose('Syphon Mind: descarte', ['Island']);
    tg.cast(S).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
    expect(tg.names(1, 'graveyard')).toEqual(['Island']);
    expect(tg.names(2, 'graveyard')).toEqual(['Mountain']);
    // o terceiro oponente não tinha carta: duas descartadas, duas compradas; você não descarta
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Wall of Omens', 'Sol Ring']);
  });
  it('ninguém descarta: você não compra', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[S], []], library: [['Wall of Omens'], []] });
    tg.cast(S).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('CR 701.9a: é um descarte (dispara "sempre que você descarta")', () => {
    const tg = setup({ battlefield: [pantanos, ['Containment Construct']], hand: [[S], ['Forest']], library: [['Wall of Omens'], []] });
    tg.cast(S).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
