import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

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
});
