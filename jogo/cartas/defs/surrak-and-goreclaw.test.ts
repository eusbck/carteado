import { describe, expect, it } from 'vitest';
import { createTokens, hasKw } from '../../motor/api.ts';
import { enterCard, fixture, runEffect } from '../../testes/artefatos.ts';

const N = 'Surrak and Goreclaw';

describe(N, () => {
  it('as outras criaturas têm atropelar; a que não é ficha entra com +1/+1 e ímpeto; ficha não', () => {
    const tg = fixture({ battlefield: [[N, 'Indomitable Ancients'], ['Elvish Mystic']] });
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'trample')).toBe(false);
    enterCard(tg, 'Ripjaw Raptor', 0);
    tg.resolveAll();
    const r = tg.bf('Ripjaw Raptor');
    expect(tg.pt(r)).toEqual([5, 6]);
    expect(hasKw(tg.g, r, 'haste')).toBe(true);
    const [ficha] = runEffect(tg, createTokens(tg.g, 0, 'Beast 3/3', 1));
    tg.resolveAll();
    expect(tg.pt(ficha)).toEqual([3, 3]);
    expect(hasKw(tg.g, ficha, 'haste')).toBe(false);
  });
});
