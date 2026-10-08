import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Curiosity Crafter', () => {
  it('ficha de criatura sua causa dano de combate a um jogador: compra; carta não conta', () => {
    const tg = setup({
      battlefield: [['Curiosity Crafter', { name: 'Saproling', token: true }, { name: 'Saproling', token: true }, 'Indomitable Ancients'], []],
      library: [['Island', 'Island', 'Island'], []],
    });
    tg.attack([[tg.all('Saproling')[0], 1], [tg.all('Saproling')[1], 1], ['Indomitable Ancients', 1]]).passTo('combatDamage');
    expect(tg.names(0, 'hand').length).toBe(2);
  });
  it('você não tem tamanho máximo de mão', () => {
    const tg = setup({ battlefield: [['Curiosity Crafter'], []], hand: [Array(9).fill('Island'), []], library: [[], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1);
    expect(tg.names(0, 'hand').length).toBe(9);
  });
});
