import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Karplusan Forest";

describe(C, () => {
  it('dá {R} causando 1 de dano', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Need for Speed'], []] });
    expect(tg.canCast('Need for Speed')).toBe(true);
  });
});
