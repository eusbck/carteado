import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Vito, Thorn of the Dusk Rose";

describe(C, () => {
  it('ganhar vida faz o oponente perder a mesma quantidade', () => {
    const tg = setup({ battlefield: [[C, ...Array(5).fill('Swamp'), { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.activate(C, 'vínculo').resolve();
    tg.attack([['Elvish Mystic', 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.life(1)).toBe(36);
    expect(tg.life(0)).toBe(42);
  });
});
