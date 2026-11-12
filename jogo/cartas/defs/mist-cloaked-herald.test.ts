import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mist-Cloaked Herald';

describe(N, () => {
  it('não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });
});
