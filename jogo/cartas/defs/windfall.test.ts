import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Windfall';
const cartas = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('cada jogador descarta a mão e compra tantas cartas quanto a maior mão descartada', () => {
    const tg = setup({
      players: 3,
      battlefield: [['Island', 'Island', 'Island'], [], []],
      hand: [[N, 'Forest'], ['Swamp', 'Swamp', 'Swamp', 'Swamp'], []],
      library: [cartas(6), cartas(6), cartas(6)],
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(expect.arrayContaining(['Forest', N]));
    expect(tg.names(1, 'graveyard')).toHaveLength(4);
    // a maior mão descartada foi a de Bruno, com quatro
    expect(tg.names(0, 'hand')).toHaveLength(4);
    expect(tg.names(1, 'hand')).toHaveLength(4);
    expect(tg.names(2, 'hand')).toHaveLength(4);
  });
});
