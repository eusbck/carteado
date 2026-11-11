import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "The Meathook Massacre";

describe(C, () => {
  it('com X=1, criaturas recebem -1/-1; drena quando criaturas morrem', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Swamp'), 'Memnite'], ['Elvish Mystic']], hand: [[C], []] });
    tg.number('X', 1).cast(C).resolve().resolveAll();
    expect(tg.find('Memnite')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
});
