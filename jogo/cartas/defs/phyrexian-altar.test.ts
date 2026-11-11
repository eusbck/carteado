import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Phyrexian Altar";

describe(C, () => {
  it('sacrifica uma criatura por uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[C, 'Memnite'], []], hand: [['Dark Ritual'], []] });
    expect(tg.canCast('Dark Ritual')).toBe(true);
  });
});
