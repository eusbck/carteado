import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bitter Reunion';
const lib = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('ao entrar, descarta uma carta e compra duas; depois dá ímpeto às suas criaturas ao ser sacrificado', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', { name: 'Elvish Mystic', ready: false }], [{ name: 'Wall of Omens', ready: false }]],
      hand: [[N, 'Island'], []], library: [lib, lib],
    });
    tg.yes(N, true).cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'haste')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(false);
  });

  it('sem descartar, não compra', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[N, 'Island'], []], library: [lib, lib] });
    tg.yes(N, false).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('com a mão vazia, não há o que descartar e nada é comprado', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
