import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Battle of Wolf 359';

describe(N, () => {
  it('as criaturas que não são artefato recebem -X/-X, sendo X o número de criaturas artefato que você controla', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Swamp'), { name: 'Borg', token: true }, 'Steel Overseer', 'Wall of Omens'], ['Indomitable Ancients', { name: 'Borg', token: true }]],
      hand: [[N], []],
    });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.pt(tg.bf('Borg', 1))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Steel Overseer'))).toEqual([1, 1]);
  });
});
