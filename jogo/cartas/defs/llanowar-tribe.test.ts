import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Llanowar Tribe';
describe(N, () => {
  it('{T}: adiciona {G}{G}{G}', () => expect(alternativasDeMana(N)).toEqual(['GGG']));
});
