import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Bronze Guardian';

describe(C, () => {
  it('força = artefatos que você controla; os outros artefatos têm resguardo {2}', () => {
    const tg = setup({ battlefield: [[C, 'Basilisk Collar', 'Darksteel Plate'], ['Sol Ring']] });
    expect(tg.pt(tg.bf(C))).toEqual([3, 5]);
    expect(hasKw(tg.g, tg.bf('Basilisk Collar'), 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'ward')).toBe(false);
    expect(hasKw(tg.g, tg.bf(C), 'double strike')).toBe(true);
  });
});
