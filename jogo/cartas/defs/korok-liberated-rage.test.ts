import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Korok, Liberated Rage';

describe(N, () => {
  it('ao atacar, as suas criaturas recebem +X/+X, sendo X o número de oponentes atacados neste turno', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Steel Overseer', 'Wall of Omens'], [], []] });
    tg.attack([[N, 1], ['Steel Overseer', 2]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
  });
});
