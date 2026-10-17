import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { abilityDefs } from '../../motor/chars.ts';

describe('Veyran, Voice of Duality', () => {
  it('o próprio magecraft de Veyran dispara duas vezes; outros gatilhos de conjuração também', () => {
    const tg = setup({
      battlefield: [['Veyran, Voice of Duality', 'Molten-Core Maestro', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []],
    });
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.pt(tg.bf('Veyran, Voice of Duality'))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Molten-Core Maestro'))).toEqual([4, 4]); // dois marcadores do opus
  });
  it('gatilho que não vem de conjurar instantânea ou feitiço não dobra', () => {
    const tg = setup({ battlefield: [['Veyran, Voice of Duality', 'Sram, Senior Edificer', 'Plains', 'Plains'], []], hand: [['Spirit Mantle'], []], library: [['Island', 'Island'], []] });
    tg.choose('criatura', ['Sram, Senior Edificer']);
    tg.cast('Spirit Mantle').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('copiar uma instantânea ou feitiço também faz os gatilhos dispararem uma vez a mais (ruling 3)', () => {
    const tg = setup({
      battlefield: [['Veyran, Voice of Duality', 'Archmage Emeritus', 'Elvish Mystic', 'Swamp', 'Swamp'], []], hand: [['Plumb the Forbidden'], []], library: [Array(10).fill('Island'), []],
    });
    tg.number('quantas vezes', 1).choose('Sacrifique', ['Elvish Mystic']);
    tg.cast('Plumb the Forbidden').resolveAll();
    // a conjuração e a cópia: o Archmage compra 2 + 2, a Plumb e a cópia compram 1 + 1
    expect(tg.names(0, 'hand').length).toBe(6);
    // o magecraft de Veyran também dispara duas vezes para cada uma
    expect(tg.pt(tg.bf('Veyran, Voice of Duality'))).toEqual([6, 6]);
  });
  it('o texto do magecraft não repete a palavra-chave', () => {
    const tg = setup({ battlefield: [['Veyran, Voice of Duality'], []] });
    const textos = abilityDefs(tg.g, tg.bf('Veyran, Voice of Duality')).map((a) => a.def.text ?? '');
    expect(textos.some((t) => t.startsWith('Magecraft — Sempre que'))).toBe(true);
    expect(textos.some((t) => t.includes('Magecraft — Magecraft'))).toBe(false);
  });
});
