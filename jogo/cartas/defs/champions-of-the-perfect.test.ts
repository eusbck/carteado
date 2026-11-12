import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/actions.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Champions of the Perfect';

describe(N, () => {
  it('exila um Elfo da mão como custo, compra ao conjurar criatura e devolve a carta ao sair', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []],
      hand: [[N, 'Elvish Mystic', 'Llanowar Elves'], []],
      library: [['Island', 'Island'], []],
    });
    tg.choose('Contemplar', ['Elvish Mystic (revelar da mão)']).cast(N).resolve();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    tg.cast('Llanowar Elves');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Island']);
  });
  it('sem Elfo para contemplar, não dá para conjurar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
  it('anulada a mágica, a carta exilada fica no exílio', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Llanowar Elves'], ['Island', 'Island']],
      hand: [[N], ['Counterspell']],
    });
    tg.choose('Contemplar', ['Llanowar Elves (no campo)']).cast(N);
    tg.pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell');
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Llanowar Elves']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
