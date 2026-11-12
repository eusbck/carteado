import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Bilbo, Fellow Conspirator';

describe(N, () => {
  it('criar duas Foods cria duas Foods e dois Treasures', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Food', 2));
    expect(tg.all('Food')).toHaveLength(2);
    expect(tg.all('Treasure')).toHaveLength(2);
    // outras fichas não mudam
    runEffect(tg, createTokens(tg.g, 0, 'Clue', 1));
    expect(tg.all('Treasure')).toHaveLength(2);
  });

  it('com Peregrin Took, a Food a mais dele também vem com um Treasure se for aplicado primeiro', () => {
    const tg = setup({ battlefield: [[N, 'Peregrin Took'], []] });
    tg.choose('substituição a aplicar primeiro', ['Peregrin Took: mais uma Food']);
    runEffect(tg, createTokens(tg.g, 0, 'Clue', 1));
    expect(tg.all('Clue')).toHaveLength(1);
    expect(tg.all('Food')).toHaveLength(1);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});
