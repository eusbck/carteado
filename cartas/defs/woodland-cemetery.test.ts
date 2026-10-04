import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Woodland Cemetery";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","G"]));
  it('entra virado sem Swamp nem Forest', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Swamp', () => expect(entraVirado(NOME, ['Swamp'])).toBe(false));
  it('entra desvirado com Forest', () => expect(entraVirado(NOME, ['Forest'])).toBe(false));
});
