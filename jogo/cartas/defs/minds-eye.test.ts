import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Mind's Eye";
describe(N, () => {
  it("a compra do oponente oferece pagamento; comprar a própria carta não cria laço", () => {

    const tg = setup({ battlefield: [[N, 'Island'], []] }); tg.yes('Pagar {1}'); runEffect(tg, draw(tg.g, 1, 1)); tg.settle(); tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.state.zones.hand[1]).toHaveLength(1); expect(tg.state.zones.stack).toHaveLength(0);
  });
});
