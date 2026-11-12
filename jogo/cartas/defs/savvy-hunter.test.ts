import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Savvy Hunter';

describe(N, () => {
  it('ao atacar, cria uma Food', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('ao bloquear, cria uma Food', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', 0]]).block([[N, 'Indomitable Ancients']]).passTo('combatDamage');
    tg.resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('sacrifique duas Foods: compre uma carta', () => {
    const tg = setup({ battlefield: [[N, { name: 'Food', token: true }, { name: 'Food', token: true }], []] });
    const mao = tg.names(0, 'hand').length;
    tg.activate(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(0);
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });
});
