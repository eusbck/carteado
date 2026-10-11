import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Greater Good';

describe(N, () => {
  it('compra cartas iguais à força da criatura sacrificada e depois descarta três', () => {
    // Zetalpa tem força 4
    const tg = setup({ battlefield: [[N, 'Zetalpa, Primal Dawn'], []], hand: [['Forest', 'Forest'], []], library: [Array(8).fill('Island'), []] });
    tg.activate(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.names(0, 'graveyard')).toHaveLength(4);
  });

  it('com menos de três cartas na mão, descarta a mão inteira', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []], hand: [[], []], library: [Array(8).fill('Island'), []] });
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Silver Myr']);
  });
});