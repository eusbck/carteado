import { describe, expect, it } from 'vitest';
import { forcaResistencia, temPalavrasChave } from '../../testes/padroes.ts';

describe('Ornithopter', () => {
  it('0/2 com voar', () => {
    expect(forcaResistencia('Ornithopter')).toEqual([0, 2]);
    expect(temPalavrasChave('Ornithopter', 'flying')).toBe(true);
  });
});
