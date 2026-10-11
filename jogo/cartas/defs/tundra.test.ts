import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Tundra";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["U","W"]));
  it('CR 305.8: não é básico, mas tem os tipos básicos (Glacial Fortress e Canopy Vista)', () => {
    // tem o tipo Plains/Island: Glacial Fortress entra desvirado
    expect(entraVirado('Glacial Fortress', [NOME])).toBe(false);
    // não é terreno básico: com ele e uma Forest, Canopy Vista ainda entra virado
    expect(entraVirado('Canopy Vista', [NOME, 'Forest'])).toBe(true);
    expect(entraVirado('Canopy Vista', ['Plains', 'Forest'])).toBe(false);
  });
});
