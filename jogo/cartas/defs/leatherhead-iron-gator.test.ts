import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Leatherhead, Iron Gator';

describe(N, () => {
  it('atropelar e ímpeto; quando ataca, dois marcadores +1/+1 em cada criatura sua', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    for (const kw of ['trample', 'haste']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([7, 7]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(tg.life(1)).toBe(vida - 7);
  });
});