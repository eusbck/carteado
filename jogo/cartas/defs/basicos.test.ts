// cobre: Plains, Island, Swamp, Mountain, Forest
import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

describe('terrenos básicos', () => {
  it('CR 305.6: cada tipo básico dá a habilidade de mana correspondente', () => {
    expect(alternativasDeMana('Plains')).toEqual(['W']);
    expect(alternativasDeMana('Island')).toEqual(['U']);
    expect(alternativasDeMana('Swamp')).toEqual(['B']);
    expect(alternativasDeMana('Mountain')).toEqual(['R']);
    expect(alternativasDeMana('Forest')).toEqual(['G']);
  });
  it('CR 110.5b: entra desvirado', () => expect(entraVirado('Forest')).toBe(false));
});
