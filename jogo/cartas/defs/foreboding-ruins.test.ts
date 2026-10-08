import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Foreboding Ruins";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","R"]));
  it('entra virado sem Swamp nem Mountain na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Swamp da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Swamp'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Mountain'], false)).toBe(true));
});
