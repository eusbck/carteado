import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Boon of the Wish-Giver';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('compra quatro cartas; ou ciclagem {1}: descarta e compra uma', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Island')], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
    const ciclo = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [lib, lib] });
    ciclo.activate(N, 'Ciclagem').resolveAll();
    expect(ciclo.names(0, 'hand')).toHaveLength(1);
    expect(ciclo.names(0, 'graveyard')).toEqual([N]);
  });
});
