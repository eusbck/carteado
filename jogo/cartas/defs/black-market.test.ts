import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Black Market";

describe(C, () => {
  it('dá {B} por marcador de carga na primeira fase principal', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 2 } }], []], library: [['Opt'], ['Opt']], step: 'upkeep' });
    tg.passTo('main1').resolveAll();
    expect(tg.state.players[0].manaPool.filter((m) => m.type === 'B').length).toBe(2);
  });
});
