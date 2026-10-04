import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Firemane Commando', () => {
  it('você ataca com duas ou mais: compra', () => {
    const tg = setup({ battlefield: [['Firemane Commando', 'Indomitable Ancients'], []], library: [['Island'], []] });
    tg.attack([['Firemane Commando', 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('atacando outro jogador com duas criaturas, ele compra', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Firemane Commando'], ['Elvish Mystic', 'Wall of Omens', 'Indomitable Ancients'], []], library: [[], ['Island'], []] });
    tg.attack([['Elvish Mystic', 2], ['Indomitable Ancients', 2]]).passTo('declareBlockers');
    expect(tg.names(1, 'hand')).toEqual(['Island']);
  });
  it('se alguma das atacantes atacou você, o outro jogador não compra', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Firemane Commando'], ['Elvish Mystic', 'Indomitable Ancients'], []], library: [[], ['Island'], []] });
    tg.attack([['Elvish Mystic', 2], ['Indomitable Ancients', 0]]).passTo('declareBlockers');
    expect(tg.names(1, 'hand')).toEqual([]);
  });
});
