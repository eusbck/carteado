import { describe, expect, it } from 'vitest';
import { alternativasDeMana, temPalavrasChave } from '../../testes/padroes.ts';

describe('Overgrown Battlement', () => {
  it('defensor; {G} para cada criatura com defensor que você controla', () => {
    expect(temPalavrasChave('Overgrown Battlement', 'defender')).toBe(true);
    expect(alternativasDeMana('Overgrown Battlement')).toEqual(['G']);
    expect(alternativasDeMana('Overgrown Battlement', ['Wall of Omens', 'Sylvan Caryatid', 'Elvish Mystic'])).toEqual(['GGG']);
  });
});
