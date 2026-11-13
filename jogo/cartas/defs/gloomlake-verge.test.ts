import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Gloomlake Verge";

describe(C, () => {
  it('dá {B} só com Island ou Swamp', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Dark Ritual'], []] });
    expect(tg.canCast('Dark Ritual')).toBe(false);
    const tg2 = setup({ battlefield: [[C, 'Island'], []], hand: [['Dark Ritual'], []] });
    expect(tg2.canCast('Dark Ritual')).toBe(true);
  });
});
