import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Camaraderie';

describe(N, () => {
  it('ganha X de vida, compra X cartas e as suas criaturas recebem +1/+1 até o fim do turno', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Forest'), ...Array(3).fill('Plains'), 'Silver Myr', 'Indomitable Ancients'], ['Elvish Mystic']], hand: [[N], []], library: [Array(8).fill('Island'), []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    // a criatura que chega depois não recebe
    const nova = enterCard(tg, 'Fatespinner', 0)!;
    expect(tg.pt(nova)).toEqual([1, 2]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});