import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Sunpetal Grove";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","W"]));
  it('entra virado sem Forest nem Plains', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Forest', () => expect(entraVirado(NOME, ['Forest'])).toBe(false));
  it('entra desvirado com Plains', () => expect(entraVirado(NOME, ['Plains'])).toBe(false));
});
