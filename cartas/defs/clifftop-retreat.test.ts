import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Clifftop Retreat";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["R","W"]));
  it('entra virado sem Mountain nem Plains', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Mountain', () => expect(entraVirado(NOME, ['Mountain'])).toBe(false));
  it('entra desvirado com Plains', () => expect(entraVirado(NOME, ['Plains'])).toBe(false));
});
