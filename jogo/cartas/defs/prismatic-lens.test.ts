import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Prismatic Lens';

describe(NOME, () => {
  it('CR 605: {T} dá {C}; {1}, {T} dá uma mana de qualquer cor', () => {
    // com uma Island para pagar o {1}, aparecem as cinco cores
    expect(alternativasDeMana(NOME, ['Island'])).toEqual(['B', 'C', 'G', 'R', 'U', 'W']);
  });
});
