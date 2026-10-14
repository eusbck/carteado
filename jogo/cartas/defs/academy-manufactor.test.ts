import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';

const NOME = 'Academy Manufactor';

const conta = (tg: ReturnType<typeof setup>) => ['Clue', 'Food', 'Treasure'].map((n) => tg.all(n).length);

describe(NOME, () => {
  it('criar duas Food cria duas de cada: Clue, Food e Treasure', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Food', 2));
    expect(conta(tg)).toEqual([2, 2, 2]);
    // outras fichas não mudam
    runEffect(tg, createTokens(tg.g, 0, 'Squirrel', 1));
    expect(tg.all('Squirrel').length).toBe(1);
  });

  it('com dois Manufactors, uma Food vira três de cada', () => {
    const tg = setup({ battlefield: [[NOME, NOME], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(conta(tg)).toEqual([3, 3, 3]);
  });
});
