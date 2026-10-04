import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rapturous Moment', () => {
  it('compra três, descarta duas e adiciona {U}{U}{R}{R}{R}', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []],
      hand: [['Rapturous Moment', 'Counterspell'], []], library: [['Plains', 'Swamp', 'Forest'], []],
    });
    tg.choose('escarte', ['Plains', 'Swamp']).cast('Rapturous Moment').resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Counterspell', 'Forest']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', 'Rapturous Moment', 'Swamp']);
    expect(tg.state.players[0].manaPool.map((m) => m.type).sort()).toEqual(['R', 'R', 'R', 'U', 'U']);
  });
});
