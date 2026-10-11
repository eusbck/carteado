import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'King of the Pride';

describe(N, () => {
  it('os outros Cats seus recebem +2/+1; ele mesmo, os Cats do oponente e as outras criaturas não', () => {
    const tg = setup({ battlefield: [[N, 'Keeper of Fables', 'Elvish Mystic'], ['Keeper of Fables']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    expect(tg.pt(tg.bf('Keeper of Fables', 0))).toEqual([6, 6]);
    expect(tg.pt(tg.bf('Keeper of Fables', 1))).toEqual([4, 5]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});
