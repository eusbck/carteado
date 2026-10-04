import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Dragonskull Summit";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","R"]));
  it('entra virado sem Swamp nem Mountain', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Swamp', () => expect(entraVirado(NOME, ['Swamp'])).toBe(false));
  it('entra desvirado com Mountain', () => expect(entraVirado(NOME, ['Mountain'])).toBe(false));
});
