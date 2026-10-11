import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Alms Collector';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('lampejo; o oponente que compraria duas ou mais compra uma, e você compra uma', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    runEffect(tg, draw(tg.g, 1, 3));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([1, 1]);
    // as suas próprias compras não mudam
    runEffect(tg, draw(tg.g, 0, 2));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([3, 1]);
  });

  it('comprar uma carta de cada vez não é substituído', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    runEffect(tg, draw(tg.g, 1, 1));
    runEffect(tg, draw(tg.g, 1, 1));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([0, 2]);
  });

  it('com um Alms Collector de cada lado, cada jogador que compraria duas acaba comprando duas', () => {
    const tg = setup({ battlefield: [[N], [N]], library: [lib, lib] });
    runEffect(tg, draw(tg.g, 0, 2));
    runEffect(tg, draw(tg.g, 1, 2));
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([2, 2]);
  });
});
