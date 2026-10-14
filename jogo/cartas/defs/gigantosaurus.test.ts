import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Gigantosaurus';
describe(N, () => {
  it('criatura Dinosaur 10/10 sem habilidades', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([10, 10]);
  });
});
