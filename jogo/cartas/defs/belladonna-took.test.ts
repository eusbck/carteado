import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Belladonna Took';

describe(N, () => {
  it('a primeira resolução no turno dá 1 de vida, a segunda compra, a terceira põe marcadores, a quarta não faz nada', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 4));
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.all('Soldier').map((id) => tg.state.objects[id].counters['+1/+1'] ?? 0)).toEqual([1, 1, 1, 1]);
    // no turno seguinte a contagem recomeça
    tg.passTo('main1', 1);
    runEffect(tg, createTokens(tg.g, 0, 'Food', 1));
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
  });
});
