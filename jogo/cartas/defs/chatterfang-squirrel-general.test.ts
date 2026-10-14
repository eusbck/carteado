import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { canBlock } from '../../motor/combat.ts';

const NOME = 'Chatterfang, Squirrel General';

describe(NOME, () => {
  it('qualquer efeito que crie fichas sob o seu controle cria também a mesma quantidade de Squirrels', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(createTokens(tg.g, 0, 'Rat', 2));
    expect(tg.all('Rat').length).toBe(2);
    expect(tg.all('Squirrel').length).toBe(2);
    // fichas do oponente não
    tg.run(createTokens(tg.g, 1, 'Rat', 1));
    expect(tg.all('Squirrel').length).toBe(2);
  });

  it('vale para Food, Clue e Treasure também', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(createTokens(tg.g, 0, 'Food', 1));
    expect(tg.all('Food').length).toBe(1);
    expect(tg.all('Squirrel').length).toBe(1);
  });

  it('{B}, sacrifique X Squirrels: a criatura alvo recebe +X/-X', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', { name: 'Squirrel', token: true }, { name: 'Squirrel', token: true }], ['Wall of Omens']] });
    tg.number('X', 2).choose('Sacrifique', ['Squirrel', 'Squirrel']).choose('criatura alvo', ['Wall of Omens']).activate(NOME, '+X/-X').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 2]);
    expect(tg.all('Squirrel')).toEqual([]);
  });

  it('passo da floresta: não pode ser bloqueado se o defensor controla uma Forest', () => {
    const tg = setup({ battlefield: [[NOME], ['Wall of Omens', 'Forest']] });
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(NOME))).toBe(false);
    const tg2 = setup({ battlefield: [[NOME], ['Wall of Omens', 'Swamp']] });
    expect(canBlock(tg2.g, tg2.bf('Wall of Omens'), tg2.bf(NOME))).toBe(true);
  });
});
