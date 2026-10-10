import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Research Thief";
describe(N, () => {
  it("dano de cada criatura artefato dispara separadamente, ao contrário de Spy Network", () => {

    const tg = setup({ battlefield: [[N, { name: 'Thopter', token: true }, { name: 'Thopter', token: true }], []] }); tg.attack(tg.all('Thopter').map(id => [id, 1])).passTo('main2'); expect(tg.state.zones.hand[0]).toHaveLength(2); expect(hasKw(tg.g, tg.bf(N), 'flash')).toBe(true);
  });
});
