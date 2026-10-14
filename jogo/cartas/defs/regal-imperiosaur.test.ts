import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Regal Imperiosaur';
describe(N, () => {
  it('os outros Dinosaurs seus recebem +1/+1; ela mesma, outras criaturas e os do oponente, não', () => {
    const tg = setup({ battlefield: [[N, 'Ripjaw Raptor', 'Indomitable Ancients'], ['Gigantosaurus']] });
    expect(tg.pt(tg.bf('Ripjaw Raptor'))).toEqual([5, 6]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(tg.pt(tg.bf('Gigantosaurus'))).toEqual([10, 10]);
  });
});
