import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Game Trail";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","R"]));
  it('entra virado sem Mountain nem Forest na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Mountain da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Mountain'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Forest'], false)).toBe(true));
  it('outro Game Trail na mão não serve para revelar', () => expect(entraVirado(NOME, [], ['Game Trail'])).toBe(true));
  it('revelando uma carta não básica com o subtipo (Cinder Glade), entra desvirado', () => expect(entraVirado(NOME, [], ['Cinder Glade'], true)).toBe(false));
});
