import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/actions.ts';
import { activateMana, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Darksteel Ingot';

describe(N, () => {
  it('indestrutível; {T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    expect(tg.find(N)).not.toBeNull();
    activateMana(tg, N, 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
  });
});