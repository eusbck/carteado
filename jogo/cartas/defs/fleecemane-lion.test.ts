import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fleecemane Lion';

describe(N, () => {
  it('monstruosa, tem resistência a magia e indestrutível; a monstruosidade não funciona duas vezes', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Forest'), ...Array(5).fill('Plains')], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'hexproof')).toBe(false);
    tg.activate(N).resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'hexproof')).toBe(true);
    expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    tg.activate(N).resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
  });
});