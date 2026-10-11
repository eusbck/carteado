import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Archangel of Thune';

describe(N, () => {
  it('atacando com vínculo com a vida, você ganha vida e cada criatura sua recebe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Elvish Mystic']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
    expect(tg.pt(id)).toEqual([4, 5]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});