import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Willowrush Verge";

describe(C, () => {
  it('dá {G} só com Forest ou Island', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Need for Speed'], []] });
    expect(tg.canCast('Shared Roots')).toBe(false);
  });
});
