import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Hedge Shredder";

describe(C, () => {
  it('terrenos moídos vão ao campo virados', () => {
    const tg = setup({ battlefield: [[C, 'Aftermath Analyst', ...Array(2).fill('Forest')], []], hand: [['Midnight Tilling'], []], library: [['Island', 'Opt', 'Opt', 'Opt'], []] });
    tg.lenient = true;
    tg.cast('Midnight Tilling').resolveAll();
    expect(tg.find('Island')).not.toBeNull();
  });
});
