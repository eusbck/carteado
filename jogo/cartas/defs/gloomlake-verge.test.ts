import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Gloomlake Verge';

describe(NOME, () => {
  it('sem Island nem Swamp, só {U}', () => {
    expect(alternativasDeMana(NOME, ['Plains'])).toEqual(['U']);
  });
  it('com um terreno do tipo Island, também {B}', () => {
    expect(alternativasDeMana(NOME, ['Island'])).toEqual(['U', 'B'].sort());
  });
  it('conta o tipo de terreno, não o nome: Watery Grave serve', () => {
    expect(alternativasDeMana(NOME, ['Watery Grave'])).toEqual(['U', 'B'].sort());
  });
});
