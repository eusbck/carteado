import { describe, expect, it } from 'vitest';
import { alternativasDeMana, jogarTerreno, setup } from '../../testes/padroes.ts';
import { createTokens } from '../../motor/api.ts';

const NOME = 'Seraph Sanctuary';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('quando entra, você ganha 1 de vida', () => {
    const tg = jogarTerreno(NOME).resolve();
    expect(tg.life(0)).toBe(41);
  });
  it('sempre que um Anjo seu entra, você ganha 1 de vida (o do oponente e outras criaturas não)', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(createTokens(tg.g, 0, 'Angel', 1));
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
    tg.run(createTokens(tg.g, 1, 'Angel', 1));
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
  });
});
