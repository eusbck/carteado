import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, jogarTerreno } from '../../testes/padroes.ts';

const NOME = "Golgari Rot Farm";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["BG"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('ao entrar, devolve um terreno seu para a mão', () => {
    const tg = jogarTerreno(NOME, { campo: ['Forest'] });
    tg.choose('Devolva um terreno', ['Forest']).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
