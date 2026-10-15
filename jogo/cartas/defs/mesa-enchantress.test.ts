import { describe, expect, it } from 'vitest';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

describe('Mesa Enchantress', () => {
  it('a compra resolve antes do encantamento', () => {
    const tg = setup({ battlefield: [['Mesa Enchantress', 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison'], []], library: [['Island'], []] });
    tg.yes('comprar uma carta', true).cast('Ghostly Prison');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find('Ghostly Prison', 'stack')).not.toBeNull();
  });

  it('encantamento posto no campo sem ser conjurado não dispara; mágica que não é encantamento também não', () => {
    const tg = setup({ battlefield: [['Mesa Enchantress', 'Plains', 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Island', 'Island'], []] });
    enterCard(tg, 'Ghostly Prison', 0);
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.cast('Wall of Omens');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
