import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Wastewood Verge";

describe(C, () => {
  it('dá {B} só com Swamp ou Forest', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []], hand: [['Dark Ritual'], []] });
    expect(tg.canCast('Dark Ritual')).toBe(true);
  });
});
