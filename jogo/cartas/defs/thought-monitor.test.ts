import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Thought Monitor";
describe(N, () => {
  it("afinidade permite pagar só azul e entrada compra duas cartas", () => {

    const tg = setup({ battlefield: [['Island', ...Array.from({ length: 6 }, () => ({ name: 'Sol Ring', tapped: true }))], []], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(2); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
