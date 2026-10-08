import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Arbor Adherent', () => {
  it('uma mana de qualquer cor, ou X de uma cor com X = maior resistência entre as outras criaturas', () => {
    expect(alternativasDeMana('Arbor Adherent')).toEqual(['B', 'G', 'R', 'U', 'W']);
    const alts = alternativasDeMana('Arbor Adherent', ['Elvish Mystic', 'Wall of Omens']);
    expect(alts).toContain('GGGG');
    expect(alts).toContain('WWWW');
    expect(alts.length).toBe(10);
  });
});
