import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Horizon Explorer";

describe(C, () => {
  it('ao atacar um jogador cria Lander', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.attack([[C, 1]]).passTo('declareBlockers');
    expect(tg.all('Lander').length).toBe(1);
  });
});
