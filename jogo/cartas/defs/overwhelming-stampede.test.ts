import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Overwhelming Stampede';

describe(N, () => {
  it('as suas criaturas ganham atropelar e +X/+X, com X igual à maior força entre elas', () => {
    // Serra Angel tem força 4
    const tg = setup({ battlefield: [[...Array(5).fill('Forest'), 'Serra Angel', 'Silver Myr'], ['Elvish Mystic']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([8, 8]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'trample')).toBe(true);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});