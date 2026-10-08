import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Overgrown Farmland";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","W"]));
  it('entra virado com só um outro terreno', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois outros terrenos', () => expect(entraVirado(NOME, ['Forest', 'Command Tower'])).toBe(false));
});
