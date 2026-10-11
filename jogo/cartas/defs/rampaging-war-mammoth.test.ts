import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as artefatos } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Rampaging War Mammoth';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('ciclando com X = 2, destrói até dois artefatos antes de você comprar a carta', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain')], ['Sol Ring', 'Basalt Monolith', 'Worn Powerstone']], hand: [[N], []], library: [lib, lib] });
    tg.number('valor de X', 2).choose('artefatos alvo', ['Sol Ring', 'Basalt Monolith']);
    tg.activate(N, 'Ciclagem');
    tg.resolve();
    expect(tg.names(1, 'battlefield')).toEqual(['Worn Powerstone']);
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('com X = 0, o gatilho não tem alvos e você só compra a carta', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Sol Ring']], hand: [[N], []], library: [lib, lib] });
    tg.number('valor de X', 0);
    tg.activate(N, 'Ciclagem').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('9/7 com atropelar', () => {
    const tg = artefatos({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([9, 7]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
  });
});
