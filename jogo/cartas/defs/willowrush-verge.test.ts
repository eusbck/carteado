import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Willowrush Verge';

describe(NOME, () => {
  it('sem Forest nem Island, só {U}', () => {
    expect(alternativasDeMana(NOME, ['Plains'])).toEqual(['U']);
  });
  it('com um terreno do tipo Forest, também {G}', () => {
    expect(alternativasDeMana(NOME, ['Forest'])).toEqual(['U', 'G'].sort());
  });
  it('conta o tipo de terreno, não o nome: Breeding Pool serve', () => {
    expect(alternativasDeMana(NOME, ['Breeding Pool'])).toEqual(['U', 'G'].sort());
  });
});
