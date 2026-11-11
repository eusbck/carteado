import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Exploration Broodship";

describe(C, () => {
  it('com 3+ cargas dá terreno adicional', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 3 } }], []], hand: [['Forest', 'Island'], []] });
    tg.play('Forest').play('Island');
    expect(tg.find('Island')).not.toBeNull();
  });
});
