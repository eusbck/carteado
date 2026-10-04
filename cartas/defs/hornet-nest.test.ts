import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Hornet Nest', () => {
  it('dispara mesmo com dano letal: uma ficha por ponto de dano', () => {
    const tg = setup({ active: 1, battlefield: [['Hornet Nest'], ['Indomitable Ancients', { name: 'Elemental 4/4', token: true }]] });
    tg.attack([['Elemental 4/4', 0]]).block([['Hornet Nest', 'Elemental 4/4']]).passTo('combatDamage');
    expect(tg.find('Hornet Nest')).toBeNull();
    expect(tg.all('Insect').length).toBe(4);
  });
});
