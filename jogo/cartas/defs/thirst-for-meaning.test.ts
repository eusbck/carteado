import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Thirst for Meaning', () => {
  it('descarta uma carta de encantamento em vez de duas; ou duas cartas quaisquer', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Thirst for Meaning'], []], library: [['Ghostly Prison', 'Forest', 'Swamp', 'Plains'], []] });
    tg.choose('descarte uma carta de encantamento', ['Descartar Ghostly Prison']);
    tg.cast('Thirst for Meaning').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Ghostly Prison', 'Thirst for Meaning']);

    const tg2 = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Thirst for Meaning'], []], library: [['Ghostly Prison', 'Forest', 'Swamp', 'Plains'], []] });
    tg2.choose('descarte uma carta de encantamento', ['Descartar duas cartas']).choose('Descarte 2 cartas', ['Ghostly Prison', 'Swamp']);
    tg2.cast('Thirst for Meaning').resolve();
    expect(tg2.names(0, 'hand')).toEqual(['Forest']);
  });

  it('sem encantamento na mão, descarta duas cartas', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Thirst for Meaning'], []], library: [['Island', 'Forest', 'Swamp'], []] });
    tg.choose('Descarte 2 cartas', ['Island', 'Swamp']);
    tg.cast('Thirst for Meaning').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
