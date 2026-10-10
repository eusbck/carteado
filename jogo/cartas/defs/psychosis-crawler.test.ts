import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Psychosis Crawler";
describe(N, () => {
  it("cada carta comprada reduz vida de cada oponente e altera a CDA da mão", () => {

    const tg = setup({ players: 4, battlefield: [[N], [], [], []], hand: [['Island'], [], [], []] }); runEffect(tg, draw(tg.g, 0, 3)); tg.settle(); tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]); expect([tg.life(1), tg.life(2), tg.life(3)]).toEqual([37, 37, 37]);
  });
});
