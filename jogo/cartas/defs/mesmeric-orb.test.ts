import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mesmeric Orb";

describe(C, () => {
  it('quem desvira um permanente moe uma', () => {
    const tg = setup({ battlefield: [[C, { name: 'Forest', tapped: true }], []], library: [['Opt', 'Opt', 'Opt'], ['Opt']], step: 'end' });
    tg.passTo('upkeep', 1).passTo('upkeep', 0);
    expect(tg.state.zones.graveyard[0].length).toBeGreaterThanOrEqual(1);
  });
});
