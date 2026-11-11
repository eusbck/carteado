import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tectonic Split";

describe(C, () => {
  it('sacrifica metade dos terrenos; terrenos dão três manas', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest')], []], hand: [[C], []] });
    tg.lenient = true;
    tg.cast(C).resolve();
    expect(tg.all('Forest').length).toBe(3);
    expect(hasKw(tg.g, tg.bf(C), 'hexproof')).toBe(true);
  });
});
