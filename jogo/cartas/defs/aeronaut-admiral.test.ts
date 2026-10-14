import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Aeronaut Admiral';
describe(N, () => {
  it('voar; os seus Veículos têm voar; os do oponente e outras criaturas, não', () => {
    const tg = setup({ battlefield: [[N, "Cultivator's Caravan", 'Indomitable Ancients'], ["Cultivator's Caravan"]] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf("Cultivator's Caravan", 0), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf("Cultivator's Caravan", 1), 'flying')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'flying')).toBe(false);
  });
});
