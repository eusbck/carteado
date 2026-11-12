import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Xenograft';

describe(N, () => {
  it('as criaturas no campo ganham o tipo; as da mão não', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Memnite'], ['Ornithopter']], hand: [[N, 'Sage Owl'], []] });
    tg.choose('Xenograft: escolha um tipo', ['Ninja']);
    tg.cast(N).resolve();
    expect(chars(tg.g, tg.bf('Memnite')).subtypes).toEqual(['Construct', 'Ninja']);
    expect(chars(tg.g, tg.bf('Ornithopter')).subtypes).toEqual(['Thopter']);
    expect(chars(tg.g, tg.find('Sage Owl', 'hand', 0)!).subtypes).toEqual(['Bird']);
  });
});
