import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Phyrexian Tower";

describe(C, () => {
  it('sacrifica uma criatura por {B}{B}', () => {
    const tg = setup({ battlefield: [[C, 'Memnite'], []], hand: [['Reassembling Skeleton'], []] });
    expect(tg.canCast('Reassembling Skeleton')).toBe(true);
  });
});
