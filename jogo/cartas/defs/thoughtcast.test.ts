import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Thoughtcast";
describe(N, () => {
  it("afinidade conta artefatos virados, preserva azul e compra duas", () => {

    const tg = setup({ battlefield: [['Island', ...Array.from({ length: 4 }, () => ({ name: 'Sol Ring', tapped: true }))], []], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(2);
    const noBlue = setup({ battlefield: [[...Array(5).fill('Sol Ring')], []], hand: [[N], []] }); expect(noBlue.canCast(N)).toBe(false);
  });
});
