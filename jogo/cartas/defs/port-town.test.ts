import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Port Town";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["U","W"]));
  it('entra virado sem Plains nem Island na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Plains da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Plains'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Island'], false)).toBe(true));
  it('outro Port Town na mão não serve para revelar', () => expect(entraVirado(NOME, [], ['Port Town'])).toBe(true));
  it('revelando uma carta não básica com o subtipo (Tundra), entra desvirado', () => expect(entraVirado(NOME, [], ['Tundra'], true)).toBe(false));
});
