import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Donatello, the Brains';

describe(N, () => {
  it('cada criação de fichas sob o seu controle cria também uma ficha Mutagen', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 2));
    tg.resolveAll();
    expect(tg.all('Soldier')).toHaveLength(2);
    expect(tg.all('Mutagen')).toHaveLength(1);
    runEffect(tg, createTokens(tg.g, 1, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.all('Mutagen')).toHaveLength(1);
  });
});