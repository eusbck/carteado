import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Pull from Tomorrow";
describe(N, () => {
  it("X anunciado paga custo correto, compra X e depois descarta; X zero ainda descarta", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Sol Ring'], []], hand: [[N], []] }); tg.number('valor de X', 2).cast(N).resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(1);
    const zero = setup({ battlefield: [['Island', 'Island'], []], hand: [[N, 'Forest'], []] }); zero.number('valor de X', 0).cast(N).resolveAll(); expect(zero.state.zones.hand[0]).toHaveLength(0);
  });
});
