import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Isolated Chapel";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","W"]));
  it('entra virado sem Plains nem Swamp', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Plains', () => expect(entraVirado(NOME, ['Plains'])).toBe(false));
  it('entra desvirado com Swamp', () => expect(entraVirado(NOME, ['Swamp'])).toBe(false));
});
