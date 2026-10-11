import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ancient Craving';

describe(N, () => {
  it('você compra três cartas e perde 3 de vida', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp')], []], hand: [[N], []], library: [Array(6).fill('Swamp'), []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.life(0)).toBe(37);
  });
});
