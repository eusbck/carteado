import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Wastewood Verge';

describe(NOME, () => {
  it('sem Swamp nem Forest, só {G}', () => {
    expect(alternativasDeMana(NOME, ['Plains'])).toEqual(['G']);
  });
  it('com um terreno do tipo Swamp, também {B}', () => {
    expect(alternativasDeMana(NOME, ['Swamp'])).toEqual(['G', 'B'].sort());
  });
  it('conta o tipo de terreno, não o nome: Overgrown Tomb serve', () => {
    expect(alternativasDeMana(NOME, ['Overgrown Tomb'])).toEqual(['G', 'B'].sort());
  });
});
