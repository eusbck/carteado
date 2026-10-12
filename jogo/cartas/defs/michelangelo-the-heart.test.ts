import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Michelangelo, the Heart';

describe(N, () => {
  it('atropelar; na sua segunda fase principal, se você atacou, um marcador +1/+1 na criatura alvo e uma ficha Food', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.choose('criatura alvo', [N]).attack([['Serra Angel', 1]]).passTo('main2', 0).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('sem atacar, não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('main2', 0).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    expect(tg.all('Food')).toHaveLength(0);
  });
});