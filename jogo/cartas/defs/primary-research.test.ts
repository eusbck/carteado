import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Primary Research', () => {
  it('a carta devolvida ao entrar já conta para a compra', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Primary Research'], []], graveyard: [['Ghostly Prison'], []], library: [['Island'], ['Island']] });
    tg.choose('valor de mana 3 ou menos', ['Ghostly Prison']);
    tg.cast('Primary Research').resolve().resolveAll();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
