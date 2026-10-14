import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Whisperer of the Wilds';
describe(N, () => {
  it('{T}: {G}; feroz: {G}{G} só com uma criatura de força 4 ou mais', () => {
    expect(alternativasDeMana(N)).toEqual(['G']);
    expect(alternativasDeMana(N, ['Ripjaw Raptor'])).toEqual(['G', 'GG']);
  });
});
