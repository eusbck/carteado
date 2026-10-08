import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Vernal Fen";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","G"]));
  it('entra virado com menos de dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Swamp'])).toBe(false));
});
