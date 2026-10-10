import { describe, expect, it } from 'vitest';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Master of Etherium";
describe(N, () => {
  it("CDA funciona fora do campo, conta a si e dá bônus só às outras criaturas artefato", () => {

    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Sol Ring'], []], hand: [[N], []] }); expect(tg.pt(tg.bf(N))).toEqual([3, 3]); expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.find(N, 'hand')!)).toEqual([3, 3]); removeCard(tg, tg.bf('Sol Ring')); expect(tg.pt(tg.bf(N))).toEqual([2, 2]); removeCard(tg, tg.bf(N)); expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});
