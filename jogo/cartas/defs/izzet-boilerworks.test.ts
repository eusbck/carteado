import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, jogarTerreno } from '../../testes/padroes.ts';

const NOME = 'Izzet Boilerworks';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['UR']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('ao entrar, devolve um terreno seu para a mão', () => {
    const tg = jogarTerreno(NOME, { campo: ['Island'] });
    tg.choose('Devolva um terreno', ['Island']).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('sem outro terreno, devolve a si mesmo para a mão', () => {
    const tg = jogarTerreno(NOME);
    tg.choose('Devolva um terreno', [NOME]).resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([NOME]);
  });
});
