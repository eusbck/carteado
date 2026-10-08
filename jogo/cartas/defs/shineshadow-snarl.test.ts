import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Shineshadow Snarl";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","W"]));
  it('entra virado sem Plains nem Swamp na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Plains da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Plains'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Swamp'], false)).toBe(true));
});
