import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Ichor Wellspring";
describe(N, () => {
  it("compra por entrada e por morte, mesmo com entrada ainda na pilha", () => {

    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[N], []] }); tg.cast(N).resolve(); expect(tg.state.zones.stack).toHaveLength(1);
    runEffect(tg, destroy(tg.g, [tg.bf(N)])); tg.settle(); tg.resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(2);
  });
});
