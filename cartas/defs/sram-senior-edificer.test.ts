import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sram, Senior Edificer', () => {
  it('compra antes de a mágica resolver', () => {
    const tg = setup({ battlefield: [['Sram, Senior Edificer', 'Plains', 'Plains'], []], hand: [['Spirit Mantle', 'Swiftfoot Boots'], []], library: [['Island', 'Island'], []] });
    tg.choose('criatura', ['Sram, Senior Edificer']);
    tg.cast('Spirit Mantle');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swiftfoot Boots', 'Island']);
    expect(tg.state.zones.stack.length).toBe(1);
  });
});
