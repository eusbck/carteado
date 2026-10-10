import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Thought Vessel";
describe(N, () => {
  it("produz incolor e evita descarte no fim do turno só para seu controlador", () => {

    const tg = setup({ battlefield: [[N], []], hand: [Array(10).fill('Forest'), []] }); activateMana(tg, N, 'C'); tg.passTo('upkeep', 1);
    expect(tg.state.zones.hand[0]).toHaveLength(10);
  });
});
