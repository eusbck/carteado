import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Geothermal Bog";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","R"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
});
