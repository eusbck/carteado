import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lyra Dawnbringer';

describe(N, () => {
  it('os outros Angels seus recebem +1/+1 e vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel', 'Slither Blade'], ['Youthful Valkyrie']] });
    const lyra = tg.bf(N);
    expect(hasKw(tg.g, lyra, 'first strike')).toBe(true);
    expect(tg.pt(lyra)).toEqual([5, 5]);
    const anjo = tg.bf('Segovian Angel');
    expect(tg.pt(anjo)).toEqual([2, 2]);
    expect(hasKw(tg.g, anjo, 'lifelink')).toBe(true);
    expect(tg.pt(tg.bf('Slither Blade'))).toEqual([1, 2]);
    expect(tg.pt(tg.bf('Youthful Valkyrie'))).toEqual([1, 3]);
    tg.attack([['Segovian Angel', 1]]).passTo('main2', 0);
    expect(tg.life(0)).toBe(42);
  });
});
