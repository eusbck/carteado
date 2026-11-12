import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Peregrin Took';

describe(N, () => {
  it('criar duas fichas quaisquer cria também uma Food a mais, uma só', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 2));
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.all('Food')).toHaveLength(1);
    // as fichas do oponente não ganham a Food
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('sacrifique três Foods: compre uma carta', () => {
    const food = { name: 'Food', token: true };
    const tg = setup({ battlefield: [[N, food, food, food], []] });
    tg.activate(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(0);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});
