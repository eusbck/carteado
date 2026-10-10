import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Spire Golem";
describe(N, () => {
  it("afinidade só por Islands e não por outras fontes de mana azul", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    const notIslands = setup({ battlefield: [['Remote Isle', 'Remote Isle', 'Remote Isle'], []], hand: [[N], []] }); expect(notIslands.canCast(N)).toBe(false);
  });
});
