import { describe, expect, it } from 'vitest';
import { createTokens, hasKw, sacrifice } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Mirkwood Bats';

describe(N, () => {
  it('voar; cada ficha criada e cada ficha sacrificada faz cada oponente perder 1 de vida', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Forest', 'Forest', 'Elvish Mystic'], [], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    runEffect(tg, createTokens(tg.g, 0, 'Food', 2));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 38, 38]);
    tg.activate('Food').resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([43, 37, 37]);
    // sacrificar o que não é ficha não dispara
    runEffect(tg, sacrifice(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([37, 37]);
  });

  it('fichas criadas por outro jogador não disparam', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 1, 'Food', 1));
    tg.resolveAll();
    expect(tg.life(1)).toBe(40);
  });
});
