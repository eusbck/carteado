import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaValue } from '../../motor/api.ts';

const N = 'Spell Snare';
describe(N, () => {
  it('anula uma criatura com valor de mana exatamente 2', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island']], hand: [['Wall of Omens'], [N]] });
    tg.cast('Wall of Omens').pass().cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
  it('CR 202.3: reforço não altera o valor de mana da mágica', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), ['Island']], hand: [['Consult the Star Charts'], [N]] });
    tg.choose('custo adicional opcional', ['Pagar: reforço {1}{U}']).cast('Consult the Star Charts');
    expect(manaValue(tg.g, tg.state.zones.stack[0])).toBe(2);
    tg.pass().cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Consult the Star Charts']);
  });
  it('não mira mágicas com valor de mana 1 ou 3', () => {
    for (const alvo of ['Sol Ring', 'Stock Up']) {
      const tg = setup({ battlefield: [Array(3).fill('Island'), ['Island']], hand: [[alvo], [N]] });
      tg.cast(alvo).pass();
      expect(tg.canCast(N)).toBe(false);
    }
  });
});
