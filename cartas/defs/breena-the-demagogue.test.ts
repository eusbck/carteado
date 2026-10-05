import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Breena, the Demagogue', () => {
  it('um oponente atacando outro com mais vida também dispara; o atacante compra e você põe dois marcadores', () => {
    // Breena é de Ana; Bruno (30) ataca Carla (45), que tem mais vida que Bruno, outro oponente de Ana
    const tg = setup({ players: 3, active: 1, battlefield: [['Breena, the Demagogue'], ['Gau, Feral Youth'], []], library: [['Island'], ['Island', 'Island'], ['Island']] });
    tg.state.players[1].life = 30;
    tg.state.players[2].life = 45;
    tg.refresh().attack([['Gau, Feral Youth', 2]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(1, 'hand').length).toBe(1);
    expect(tg.pt(tg.bf('Breena, the Demagogue'))).toEqual([3, 5]);
  });
  it('atacado sem mais vida que outro oponente seu: não dispara', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Breena, the Demagogue'], ['Gau, Feral Youth'], []], library: [['Island'], ['Island', 'Island'], ['Island']] });
    tg.state.players[2].life = 30;
    tg.refresh().attack([['Gau, Feral Youth', 2]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(1, 'hand').length).toBe(0);
    expect(tg.pt(tg.bf('Breena, the Demagogue'))).toEqual([1, 3]);
  });
});
