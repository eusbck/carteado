import { describe, expect, it } from 'vitest';
import { alternativasDeMana, forcaResistencia } from '../../testes/padroes.ts';

describe('Great Forest Druid', () => {
  it('0/4 que produz uma mana de qualquer cor', () => {
    expect(forcaResistencia('Great Forest Druid')).toEqual([0, 4]);
    expect(alternativasDeMana('Great Forest Druid')).toEqual(['B', 'G', 'R', 'U', 'W']);
  });
});
