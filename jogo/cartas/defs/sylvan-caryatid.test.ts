import { describe, expect, it } from 'vitest';
import { alternativasDeMana, temPalavrasChave } from '../../testes/padroes.ts';

describe('Sylvan Caryatid', () => {
  it('defensor e resistência a magia', () => expect(temPalavrasChave('Sylvan Caryatid', 'defender', 'hexproof')).toBe(true));
  it('{T}: uma mana de qualquer cor', () => expect(alternativasDeMana('Sylvan Caryatid')).toEqual(['B', 'G', 'R', 'U', 'W']));
});
