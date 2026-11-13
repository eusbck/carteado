import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Reprocess';

describe(N, () => {
  it('compra uma carta por artefato, criatura ou terreno sacrificado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Sol Ring', 'Wall of Omens'], []], hand: [[N], []], library: [['Hex', 'Hex', 'Hex', 'Hex'], []] });
    tg.choose('Reprocess: sacrifique', ['Sol Ring', 'Wall of Omens', 'Swamp']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex', 'Hex', 'Hex']);
  });
  it('sem sacrificar nada, não compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [['Hex'], []] });
    tg.choose('Reprocess: sacrifique', []);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
