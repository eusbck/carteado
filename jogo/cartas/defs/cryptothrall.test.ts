import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cryptothrall';

describe(N, () => {
  it('as outras criaturas artefato que você controla têm resistência a magia', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], ['Silver Myr']] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Silver Myr', 0), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'hexproof')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Silver Myr', 1), 'hexproof')).toBe(false);
  });
});