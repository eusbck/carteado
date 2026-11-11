import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "The Masamune";

describe(C, () => {
  it('atacando, a criatura equipada tem iniciativa', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []], library: [['Opt'], ['Opt']], step: 'main1' });
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'first strike')).toBe(false);
    tg.attack([['Elvish Mystic', 1]]);
    tg.passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'first strike')).toBe(true);
  });
});
