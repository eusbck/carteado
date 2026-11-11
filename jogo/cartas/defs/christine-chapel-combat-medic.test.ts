import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Christine Chapel, Combat Medic';

describe(N, () => {
  it('ao entrar, ganha vida igual aos terrenos com nomes diferentes, e o ganho põe dois marcadores nela', () => {
    // Forest, Forest, Island, Plains: três nomes diferentes
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});
