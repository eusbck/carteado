import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loyal Guardian';

describe(N, () => {
  it('controlando o seu comandante, cada criatura sua ganha um marcador +1/+1 no início do combate', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }], ['Elvish Mystic']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.passTo('declareAttackers', 0);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });

  it('sem o seu comandante no campo, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], [{ name: 'Elvish Mystic', commander: true }]] });
    tg.passTo('declareAttackers', 0);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});