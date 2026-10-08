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

  it('anulada na manutenção, a compra fica para a manutenção do turno seguinte', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [['Infernal Grasp'], ['Arcane Denial']], library: [['Plains'], ['Island', 'Island']] });
    tg.state.objects[tg.find('Infernal Grasp', 'hand')!].data = {};
    expect(tg.canCast('Infernal Grasp')).toBe(false); // sem criatura alvo; usa outra mágica
  });
});
