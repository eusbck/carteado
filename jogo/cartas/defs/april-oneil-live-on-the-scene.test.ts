import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = "April O'Neil, Live on the Scene";

describe(N, () => {
  it('investiga sempre que um Mutant, Ninja ou Turtle seu entra', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.all('Clue')).toHaveLength(0);
    runEffect(tg, createTokens(tg.g, 0, 'Ninja', 1));
    tg.resolveAll();
    expect(tg.all('Clue')).toHaveLength(1);
  });
});