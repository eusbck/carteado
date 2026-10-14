import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Angel of Vitality';

describe(N, () => {
  it('com 40 de vida (Commander), recebe +2/+2', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });

  it('abaixo de 25 de vida perde o +2/+2', () => {
    const tg = setup({ life: 24, battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
  });

  it('soma 1 a cada evento de ganhar vida, de qualquer tamanho', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 1, tg.bf(N));
    gainLife(tg.g, 0, 4, tg.bf(N));
    expect(tg.life(0)).toBe(47);
    // o oponente não
    gainLife(tg.g, 1, 3, tg.bf(N));
    expect(tg.life(1)).toBe(43);
  });
});
