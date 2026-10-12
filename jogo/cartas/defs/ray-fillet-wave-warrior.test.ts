import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Ray Fillet, Wave Warrior';

describe(N, () => {
  it('voar e evoluir; a criatura sua com marcador que causa dano de combate a um jogador compra uma carta', () => {
    const tg = setup({ battlefield: [[N, { name: 'Serra Angel', counters: { '+1/+1': 1 } }], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([0, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 3]);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});