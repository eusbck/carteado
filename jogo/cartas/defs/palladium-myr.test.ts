import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Palladium Myr";
describe(N, () => {
  it("produz a mana indicada; criatura com enjoo não pode ativar símbolo de virar", () => {

    const tg = setup({ battlefield: [[N], []] }); activateMana(tg, N, 'C'); expect(tg.state.players[0].manaPool.map(u => u.type).join('')).toBe('CC');
    const sick = setup({ battlefield: [[{ name: N, ready: false }], []] }); expect(manaOptions(sick.g, 0).filter(o => o.obj === sick.bf(N))).toHaveLength(0);
  });
});
