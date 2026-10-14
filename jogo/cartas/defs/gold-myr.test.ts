import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Gold Myr';
describe(N, () => {
  it('{T}: adiciona {W}', () => expect(alternativasDeMana(N)).toEqual(['W']));
});
