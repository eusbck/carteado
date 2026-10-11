import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Black Market Connections';
const lib = Array(8).fill('Swamp');
const VENDER = 'Vender Contrabando — Crie uma ficha de Treasure. Você perde 1 de vida';
const COMPRAR = 'Comprar Informação — Compre uma carta. Você perde 2 de vida';
const CONTRATAR = 'Contratar um Mercenário — Crie uma ficha de criatura Shapeshifter 3/2 incolor com polimorfo. Você perde 3 de vida';

describe(N, () => {
  it('os três modos: Treasure, uma carta e um Shapeshifter 3/2 com polimorfo, por 6 de vida', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [lib, lib] });
    tg.choose('modo', [VENDER, COMPRAR, CONTRATAR]);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(34);
    expect(tg.all('Treasure')).toHaveLength(1);
    // a compra do turno e a do modo
    expect(tg.names(0, 'hand')).toHaveLength(2);
    const [ficha] = tg.all('Shapeshifter');
    expect(tg.pt(ficha)).toEqual([3, 2]);
    expect(chars(tg.g, ficha).subtypes).toContain('Villain');
  });

  it('um modo só: Treasure por 1 de vida', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [lib, lib] });
    tg.choose('modo', [VENDER]);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.all('Shapeshifter')).toHaveLength(0);
  });
});
