import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe("Tocasia's Welcome", () => {
  it('criaturas de valor de mana 3 ou menos entrando: compra uma vez por turno', () => {
    const tg = setup({ battlefield: [["Tocasia's Welcome"], []], library: [['Island', 'Island'], []] });
    tg.run(createTokens(tg.g, 0, 'Saproling', 2));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('valor de mana 4 ou mais não dispara', () => {
    const tg = setup({ battlefield: [["Tocasia's Welcome", 'Sol Ring', 'Plains', 'Plains'], []], hand: [['Solemn Simulacrum'], []], library: [['Island'], []] });
    tg.yes('terreno básico', false).cast('Solemn Simulacrum').resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
