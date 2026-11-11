import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Squandered Resources";

describe(C, () => {
  it('sacrifica terreno por mana', () => {
    const tg = setup({ battlefield: [[C, 'Mountain'], []], hand: [['Need for Speed'], []] });
    expect(tg.canCast('Need for Speed')).toBe(true);
  });
});
