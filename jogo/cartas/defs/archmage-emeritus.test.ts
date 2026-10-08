import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Archmage Emeritus', () => {
  it('conjurar instantânea ou feitiço: compra uma carta', () => {
    const tg = setup({ battlefield: [['Archmage Emeritus', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.names(0, 'hand').length).toBe(3);
  });
  it('copiar a mágica dispara; cada cópia dispara uma vez', () => {
    const tg = setup({ battlefield: [['Archmage Emeritus', 'Swamp', 'Swamp', 'Elvish Mystic', 'Wall of Omens'], []], hand: [['Plumb the Forbidden'], []], library: [Array(8).fill('Island'), []] });
    tg.number('quantas vezes', 2).choose('Sacrifique', ['Elvish Mystic']).choose('Sacrifique', ['Wall of Omens']);
    tg.cast('Plumb the Forbidden').resolveAll();
    // magecraft: 1 conjuração + 2 cópias = 3; Plumb e as cópias: 3
    expect(tg.names(0, 'hand').length).toBe(6);
    expect(tg.life(0)).toBe(37);
  });
});
