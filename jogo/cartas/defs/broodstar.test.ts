import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Broodstar";
describe(N, () => {
  it("afinidade conta artefatos virados, CDA funciona na mão e no campo", () => {

    const tg = setup({ battlefield: [['Island', 'Island', ...Array.from({ length: 8 }, () => ({ name: 'Sol Ring', tapped: true }))], []], hand: [[N], []] }); expect(tg.pt(tg.find(N, 'hand')!)).toEqual([8, 8]); tg.cast(N).resolveAll(); expect(tg.pt(tg.bf(N))).toEqual([8, 8]); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
