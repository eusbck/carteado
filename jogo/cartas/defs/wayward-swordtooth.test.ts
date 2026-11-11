import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Wayward Swordtooth";

describe(C, () => {
  it('dá um terreno adicional', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest', 'Island'], []] });
    tg.play('Forest').play('Island');
    expect(tg.find('Island')).not.toBeNull();
  });
});
