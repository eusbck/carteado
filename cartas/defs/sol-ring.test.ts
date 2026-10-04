import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Sol Ring', () => {
  it('{T}: adiciona {C}{C}', () => expect(alternativasDeMana('Sol Ring')).toEqual(['CC']));
});
