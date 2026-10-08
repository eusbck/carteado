import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Teshar, Ancestor's Apostle", () => {
  it('artefato e lendária disparam; mágica comum não', () => {
    const tg = setup({
      battlefield: [["Teshar, Ancestor's Apostle", 'Plains', 'Plains', 'Plains', 'Mountain', 'Mountain'], []], hand: [['Sol Ring', 'Gau, Feral Youth', 'Wall of Omens'], []],
      graveyard: [['Elvish Mystic', 'Glissa Sunslayer', 'Archfiend of Depravity'], []], library: [['Island', 'Island'], []],
    });
    tg.choose('valor de mana 3 ou menos', ['Elvish Mystic']);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    tg.choose('valor de mana 3 ou menos', ['Glissa Sunslayer']);
    tg.cast('Gau, Feral Youth').resolveAll();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Archfiend of Depravity']);
  });
});
