import { describe, expect, it } from 'vitest';
import { forcaResistencia } from '../../testes/padroes.ts';

describe('Indomitable Ancients', () => {
  it('é uma criatura 2/10 sem habilidades', () => expect(forcaResistencia('Indomitable Ancients')).toEqual([2, 10]));
});
