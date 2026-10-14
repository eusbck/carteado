import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Terrian, World Tyrant';
describe(N, () => {
  it('criatura lendária Dinosaur Ooze 9/7 sem habilidades', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), []], hand: [[N], []] });
    tg.cast(N).resolve();
    const c = chars(tg.g, tg.bf(N));
    expect(tg.pt(tg.bf(N))).toEqual([9, 7]);
    expect(c.supertypes).toContain('Legendary');
    expect(c.abilities).toHaveLength(0);
  });
});
