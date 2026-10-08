import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Augusta, Order Returned', () => {
  it('o alvo é escolhido no gatilho reflexivo: cada carta não terreno exilada vira um marcador', () => {
    const tg = setup({ players: 3, battlefield: [['Augusta, Order Returned', 'Elvish Mystic'], [], []], graveyard: [['Wall of Omens'], ['Island'], ['Zetalpa, Primal Dawn']] });
    tg.choose('criatura atacante alvo', ['Elvish Mystic']);
    tg.attack([['Augusta, Order Returned', 1], ['Elvish Mystic', 2]]).passTo('declareBlockers');
    expect(tg.state.zones.graveyard.flat().length).toBe(0);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });
});
