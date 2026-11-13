import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Craterhoof Behemoth";

describe(C, () => {
  it('criaturas recebem +X/+X e atropelar', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Forest'), 'Memnite'], []], hand: [[C], []] });
    tg.cast(C).resolve().resolveAll();
    expect(tg.pt(tg.bf('Memnite'))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Memnite'), 'trample')).toBe(true);
  });
});
