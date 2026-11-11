import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Sundown Pass';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['R', 'W']));
  it('entra virado com só um outro terreno', () => expect(entraVirado(NOME, ['Mountain'])).toBe(true));
  it('CR 614.1c: entra desvirado com dois outros terrenos', () => expect(entraVirado(NOME, ['Mountain', 'Plains'])).toBe(false));
});
