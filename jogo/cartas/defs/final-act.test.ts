import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Final Act', () => {
  it('com vários modos, na ordem escrita', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Sol Ring', 'Sol Ring'], ['Indomitable Ancients', { name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]],
      graveyard: [['Plains'], ['Island']], hand: [['Final Act'], []],
    });
    tg.choose('modo', ['Destrua todas as criaturas', 'Destrua todos os planeswalkers', 'Exile todos os cemitérios']).cast('Final Act').resolve();
    // as criaturas e o planeswalker destruídos vão ao cemitério e depois o exílio de cemitérios os pega
    expect(tg.state.zones.graveyard.flat().length).toBe(1); // só o próprio Final Act, que vai ao cemitério depois
    expect(tg.names(1, 'exile').sort()).toEqual(['Indomitable Ancients', 'Island', 'Quintorius, History Chaser']);
  });
  it('cada oponente perde os marcadores de jogador (veneno)', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Sol Ring', 'Sol Ring'], []], hand: [['Final Act'], []] });
    tg.state.players[1].counters.poison = 5;
    tg.state.players[0].counters.poison = 2;
    tg.choose('modo', ['Cada oponente perde todos os marcadores']).cast('Final Act').resolve();
    expect(tg.state.players[1].counters).toEqual({});
    expect(tg.state.players[0].counters.poison).toBe(2);
  });
});
