import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jumbo Cactuar';

describe(N, () => {
  it('ao atacar, recebe +9999/+0 até o fim do turno', () => {
    const tg = setup({ battlefield: [[N], []], step: 'beginCombat' });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([10000, 7]);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(40 - 10000);
  });
});
