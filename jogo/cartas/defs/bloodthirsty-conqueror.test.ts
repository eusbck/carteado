import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Bloodthirsty Conqueror";

describe(C, () => {
  it('quando um oponente perde vida, você ganha', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.attack([[C, 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.life(0)).toBe(45);
  });
});
