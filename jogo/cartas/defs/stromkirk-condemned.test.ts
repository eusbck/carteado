import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Stromkirk Condemned';

describe(N, () => {
  it('descartando uma carta, os seus Vampires recebem +1/+1, só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], ['Vampire Nighthawk']], hand: [['Swamp', 'Swamp'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.choose('Descarte', ['Swamp']).activate(N, 'Descarte uma carta').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 0))).toEqual([3, 4]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 1))).toEqual([2, 3]);
    expect(() => tg.activate(N, 'Descarte uma carta')).toThrow();
  });
});
