import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Frontier Warmonger';

describe(NOME, () => {
  it('suas criaturas que atacam um oponente ganham ameaçar até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'menace')).toBe(true);
    expect(hasKw(tg.g, tg.bf(NOME), 'menace')).toBe(false);
  });

  it('criaturas de um oponente atacando outro oponente também ganham ameaçar', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[NOME], ['Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 2]]).passTo('declareBlockers', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'menace')).toBe(true);
  });

  it('atacando você, não', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'menace')).toBe(false);
  });
});
