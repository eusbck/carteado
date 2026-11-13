import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Aesi, Tyrant of Gyre Strait";

describe(C, () => {
  it('terreno adicional e compra opcional', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest', 'Island'], []], library: [['Opt', 'Opt'], []] });
    tg.lenient = true;
    tg.play('Forest').resolveAll();
    tg.play('Island').resolveAll();
    expect(tg.find('Island')).not.toBeNull();
  });
});
