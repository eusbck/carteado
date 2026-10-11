import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Scrubland";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","W"]));
  it('CR 305.8: não é básico, mas tem os tipos básicos (Isolated Chapel e Canopy Vista)', () => {
    // tem o tipo Plains/Swamp: Isolated Chapel entra desvirado
    expect(entraVirado('Isolated Chapel', [NOME])).toBe(false);
    // não é terreno básico: com ele e uma Forest, Canopy Vista ainda entra virado
    expect(entraVirado('Canopy Vista', [NOME, 'Forest'])).toBe(true);
    expect(entraVirado('Canopy Vista', ['Plains', 'Forest'])).toBe(false);
  });
});
