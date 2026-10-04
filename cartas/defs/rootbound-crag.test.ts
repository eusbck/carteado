import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Rootbound Crag";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","R"]));
  it('entra virado sem Mountain nem Forest', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Mountain', () => expect(entraVirado(NOME, ['Mountain'])).toBe(false));
  it('entra desvirado com Forest', () => expect(entraVirado(NOME, ['Forest'])).toBe(false));
});
