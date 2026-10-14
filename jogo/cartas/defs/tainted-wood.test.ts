import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Tainted Wood';

describe(NOME, () => {
  it('sem Swamp, só {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('com um Swamp, {C}, {B} ou {G}', () => expect(alternativasDeMana(NOME, ['Swamp'])).toEqual(['B', 'C', 'G']));
});
