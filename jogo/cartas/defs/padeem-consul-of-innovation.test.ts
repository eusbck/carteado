import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Padeem, Consul of Innovation";
describe(N, () => {
  it("protege artefatos e compra no empate, ignorando não artefatos de maior custo", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], ['Sol Ring', 'Zetalpa, Primal Dawn']] }); expect(hasKw(tg.g, tg.bf('Sol Ring', 0), 'hexproof')).toBe(true);
    tg.passTo('upkeep', 0); expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it("se perder o maior artefato antes da resolução, não compra", () => {

    const tg = setup({ battlefield: [[N, 'Hedron Archive'], ['Sol Ring']] }); tg.passUntil(t => t.state.turn.step === 'upkeep' && t.state.turn.active === 0 && t.state.zones.stack.length > 0);
    removeCard(tg, tg.bf('Hedron Archive')); tg.resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(0);
  });
});
