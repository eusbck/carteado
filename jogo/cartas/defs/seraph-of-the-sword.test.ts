import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Seraph of the Sword';

describe(N, () => {
  it('previne o dano de combate causado a ela; outro dano, não', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Thieving Amalgam']] });
    tg.attack([['Thieving Amalgam', 0]]).block([[N, 'Thieving Amalgam']]).passTo('main2', 1);
    const s = tg.bf(N);
    expect(tg.state.objects[s].damage).toBe(0);
    dealDamage(tg.g, [{ source: tg.bf('Thieving Amalgam'), target: { kind: 'obj', id: s }, amount: 2, combat: false }]);
    expect(tg.state.objects[s].damage).toBe(2);
  });
});
