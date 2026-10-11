import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Underground Sea";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","U"]));
  it('CR 305.8: não é básico, mas tem os tipos básicos (Drowned Catacomb e Canopy Vista)', () => {
    // tem o tipo Island/Swamp: Drowned Catacomb entra desvirado
    expect(entraVirado('Drowned Catacomb', [NOME])).toBe(false);
    // não é terreno básico: com ele e uma Forest, Canopy Vista ainda entra virado
    expect(entraVirado('Canopy Vista', [NOME, 'Forest'])).toBe(true);
    expect(entraVirado('Canopy Vista', ['Plains', 'Forest'])).toBe(false);
  });
});
