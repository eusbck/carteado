import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Mister Fantastic, Reed Richards';

describe(N, () => {
  it('alcance; várias fichas suas entrando juntas dão uma compra só, e é opcional', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'reach')).toBe(true);
    tg.yes('Mister Fantastic', true);
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 3));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    tg.yes('Mister Fantastic', false);
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('fichas do oponente não disparam', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
