import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Marwyn, the Preserver";

describe(C, () => {
  it('terrenos têm resistência a magia', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []] });
    expect(hasKw(tg.g, tg.bf('Forest'), 'hexproof')).toBe(true);
  });
});
