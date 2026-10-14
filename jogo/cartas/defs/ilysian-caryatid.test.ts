import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Ilysian Caryatid';
describe(N, () => {
  it('uma mana de qualquer cor; com uma criatura de força 4 ou mais, duas de uma cor só', () => {
    expect(alternativasDeMana(N)).toEqual(['B', 'G', 'R', 'U', 'W']);
    expect(alternativasDeMana(N, ['Zetalpa, Primal Dawn'])).toEqual(['BB', 'GG', 'RR', 'UU', 'WW']);
  });
});
