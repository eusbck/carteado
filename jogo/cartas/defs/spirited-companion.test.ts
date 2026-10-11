import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Spirited Companion';

describe(N, () => {
  it('criatura encantamento 1/1; ao entrar, compra uma carta', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [Array(4).fill('Forest'), []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(chars(tg.g, id).types.sort()).toEqual(['Creature', 'Enchantment']);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
