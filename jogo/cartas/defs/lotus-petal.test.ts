import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lotus Petal';

describe(N, () => {
  it('{T}, sacrifique: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    activateMana(tg, N, 'W');
    expect(tg.find(N)).toBeNull();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['W']);
  });
});