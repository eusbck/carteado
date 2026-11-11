import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Vineglimmer Snarl';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'U']));
  it('entra virado sem Forest nem Island na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Forest da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Forest'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Island'], false)).toBe(true));
});
