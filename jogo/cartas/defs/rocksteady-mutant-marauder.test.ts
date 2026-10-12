import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Rocksteady, Mutant Marauder';

describe(N, () => {
  it('atropelar; outra criatura sua que não é ficha entrando põe um marcador +1/+1 na criatura alvo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Silver Myr'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('criatura alvo', [N]).cast('Silver Myr').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});