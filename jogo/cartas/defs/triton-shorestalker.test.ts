import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Triton Shorestalker';

describe(N, () => {
  it('não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Baleful Strix']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(tg.bf(N)))).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });
});
