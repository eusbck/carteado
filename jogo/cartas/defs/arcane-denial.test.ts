import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Arcane Denial', () => {
  it('o controlador da mágica anulada escolhe de 0 a 2 na manutenção seguinte', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']],
      hand: [["Night's Whisper"], ['Arcane Denial']],
      library: [['Plains', 'Plains', 'Plains'], ['Island', 'Island', 'Island']],
    });
    tg.cast("Night's Whisper").pass();
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Arcane Denial').resolve();
    expect(tg.names(0, 'graveyard')).toContain("Night's Whisper");
    // CR 603.7: nada acontece até a manutenção do próximo turno
    expect(tg.state.zones.hand[0].length).toBe(0);
    tg.number('quantas cartas', 1);
    tg.passTo('upkeep', 1);
    tg.resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(1); // Ana escolheu 1
    expect(tg.state.zones.hand[1].length).toBe(1); // Bruno compra 1 (antes da compra normal)
  });

  it('CR 603.7: anulada durante a manutenção, as compras ficam para a manutenção do turno seguinte', () => {
    const tg = setup({
      step: 'upkeep',
      battlefield: [['Mountain'], ['Island', 'Island']],
      hand: [['Lightning Bolt'], ['Arcane Denial']],
      library: [['Plains', 'Plains', 'Plains', 'Plains'], ['Island', 'Island', 'Island']],
    });
    tg.choose('alvo', ['Bruno']).cast('Lightning Bolt').pass();
    tg.choose('mágica alvo', ['Lightning Bolt']).cast('Arcane Denial').resolve();
    expect(tg.names(0, 'graveyard')).toContain('Lightning Bolt');
    expect(tg.life(1)).toBe(40);
    // ainda no turno de Ana: só a compra normal dela
    tg.passTo('main1', 0);
    expect(tg.state.zones.hand[0].length).toBe(1);
    expect(tg.state.zones.hand[1].length).toBe(0);
    tg.number('quantas cartas', 2);
    tg.passTo('upkeep', 1);
    tg.resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(3); // a compra do turno e as duas da Arcane Denial
    expect(tg.state.zones.hand[1].length).toBe(1); // a de Bruno, antes da compra normal dele
  });
});
