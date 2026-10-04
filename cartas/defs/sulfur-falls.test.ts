import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Sulfur Falls";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["R","U"]));
  it('entra virado sem Island nem Mountain', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Island', () => expect(entraVirado(NOME, ['Island'])).toBe(false));
  it('entra desvirado com Mountain', () => expect(entraVirado(NOME, ['Mountain'])).toBe(false));
});
