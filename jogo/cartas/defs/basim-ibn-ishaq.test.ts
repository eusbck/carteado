import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Basim Ibn Ishaq';

describe(N, () => {
  it('a primeira mágica histórica do turno compra uma carta e deixa Basim sem poder ser bloqueado; a segunda, não', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], ['Wall of Omens']], hand: [['Lotus Petal', 'Silver Myr', 'Elvish Mystic'], []], library: [Array(3).fill('Island'), ['Island']] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    tg.cast('Lotus Petal').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr', 'Island']);
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(N))).toBe(false);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});