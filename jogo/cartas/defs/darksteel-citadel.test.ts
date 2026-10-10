import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Darksteel Citadel";
describe(N, () => {
  it("é jogada como terreno, tem indestrutível e produz incolor", () => {

    const tg = setup({ hand: [[N], []] }); expect(tg.canCast(N)).toBe(false); tg.play(N); expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    activateMana(tg, N, 'C'); expect(tg.state.players[0].manaPool[0].type).toBe('C');
  });
});
