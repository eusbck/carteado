import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Currency Converter', () => {
  it('descartar: pode exilar; {T}: devolve ao cemitério e cria Tesouro (terreno) ou Rogue (não terreno)', () => {
    const tg = setup({ battlefield: [['Currency Converter', 'Plains', 'Plains'], []], hand: [['Forest'], []], library: [['Wall of Omens'], []] });
    tg.yes('Currency Converter', true).choose('Descarte', ['Forest']);
    tg.activate('Currency Converter', 'Compre').resolve().resolve();
    expect(tg.names(0, 'exile')).toEqual(['Forest']);
    tg.state.objects[tg.bf('Currency Converter')].tapped = false;
    tg.refresh();
    tg.activate('Currency Converter', 'Coloque').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.all('Treasure').length).toBe(1);
  });
  it('carta não terreno vira Rogue 2/2', () => {
    const tg = setup({ battlefield: [['Currency Converter', 'Plains', 'Plains'], []], hand: [['Counterspell'], []], library: [['Wall of Omens'], []] });
    tg.yes('Currency Converter', true).choose('Descarte', ['Counterspell']);
    tg.activate('Currency Converter', 'Compre').resolve().resolve();
    tg.state.objects[tg.bf('Currency Converter')].tapped = false;
    tg.refresh();
    tg.activate('Currency Converter', 'Coloque').resolve();
    expect(tg.pt(tg.bf('Rogue'))).toEqual([2, 2]);
  });
});
