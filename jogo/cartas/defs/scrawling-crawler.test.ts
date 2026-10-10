import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Scrawling Crawler";
describe(N, () => {
  it("cada jogador compra na manutenção e só oponentes perdem vida por compra", () => {

    const tg = setup({ players: 4, battlefield: [[N], [], [], []] }); tg.passTo('upkeep', 0); expect(tg.state.zones.hand[0]).toHaveLength(1); expect([tg.life(1), tg.life(2), tg.life(3)]).toEqual([38, 38, 38]); // cada oponente comprou no próprio turno e na manutenção de Ana
    expect(tg.life(0)).toBe(40);
  });
});
