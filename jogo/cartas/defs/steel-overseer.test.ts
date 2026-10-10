import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Steel Overseer";
describe(N, () => {
  it("marca a si e só as criaturas artefato controladas", () => {

    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Sol Ring', 'Elvish Mystic'], ['Silver Myr']] }); tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1); expect(tg.pt(tg.bf('Silver Myr', 0))).toEqual([2, 2]); expect(tg.pt(tg.bf('Silver Myr', 1))).toEqual([1, 1]); expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});
