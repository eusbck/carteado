import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Memory Guardian";
describe(N, () => {
  it("afinidade preserva custo azul e voar", () => {

    const tg = setup({ battlefield: [['Island', ...Array.from({ length: 4 }, () => ({ name: 'Sol Ring', tapped: true }))], []], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(tg.pt(tg.bf(N))).toEqual([3, 4]); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
