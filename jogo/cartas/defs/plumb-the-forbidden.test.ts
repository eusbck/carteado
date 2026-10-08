import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Plumb the Forbidden', () => {
  it('sem sacrificar, compra uma e perde 1', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [['Plumb the Forbidden'], []], library: [['Island', 'Island'], []] });
    tg.number('quantas vezes', 0).cast('Plumb the Forbidden').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
    expect(tg.life(0)).toBe(39);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
  it('uma cópia para cada criatura sacrificada; magecraft dispara para cada cópia', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic', 'Wall of Omens', 'Storm-Kiln Artist'], []], hand: [['Plumb the Forbidden'], []], library: [Array(5).fill('Island'), []] });
    tg.number('quantas vezes', 2).choose('Sacrifique', ['Elvish Mystic']).choose('Sacrifique', ['Wall of Omens']);
    tg.cast('Plumb the Forbidden');
    expect(tg.state.zones.stack.length).toBe(3); // mágica, gatilho de cópia e magecraft
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(3);
    expect(tg.life(0)).toBe(37);
    expect(tg.all('Treasure').length).toBe(3);
  });
});
