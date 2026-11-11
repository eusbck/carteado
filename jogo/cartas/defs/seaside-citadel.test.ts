import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Seaside Citadel';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'U', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
});
