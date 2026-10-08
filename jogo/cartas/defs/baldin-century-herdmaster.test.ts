import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Baldin, Century Herdmaster', () => {
  it('no seu turno, as criaturas atribuem dano pela resistência; ao atacar, +0/+X com X = cartas na mão', () => {
    const tg = setup({ battlefield: [['Baldin, Century Herdmaster', 'Indomitable Ancients'], []], hand: [['Island', 'Island', 'Island'], []] });
    tg.choose('até cem criaturas alvo', ['Indomitable Ancients']);
    tg.attack([['Baldin, Century Herdmaster', 1], ['Indomitable Ancients', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(40 - 7 - 13);
  });
  it('no turno do oponente, não', () => {
    const tg = setup({ active: 1, battlefield: [['Baldin, Century Herdmaster'], ['Indomitable Ancients']], library: [[], []] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('combatDamage');
    expect(tg.life(0)).toBe(38);
  });
});
