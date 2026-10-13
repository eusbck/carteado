import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Tarcísio, o Plano B';
const C = 'Bolsonaro, o Genocida';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('as outras criaturas suas recebem +1/+1; sem o comandante no campo ele é 6/6 com vigilância', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Llanowar Elves']], command: [[{ name: C, commander: true }], []], library: [lib, lib] });
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Llanowar Elves'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    expect(hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
  });

  it('com o comandante no campo, ele volta a ser 3/3', () => {
    const tg = setup({ battlefield: [[N, { name: C, commander: true }], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf(C))).toEqual([5, 5]);
  });
});
