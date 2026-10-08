import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Turbulent Fen";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","G"]));
  it('entra virado se os oponentes têm menos de oito terrenos', () => expect(entraVirado(NOME, [], [], true, Array(7).fill('Forest'))).toBe(true));
  it('entra desvirado se os oponentes têm oito ou mais terrenos', () => expect(entraVirado(NOME, [], [], true, Array(8).fill('Forest'))).toBe(false));
});
