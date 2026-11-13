import { describe, expect, it } from 'vitest';
import { createTokens, gainLife } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Tippy-Toe, Terrific Partner';

describe(N, () => {
  it('criar fichas cria também uma Food a mais, uma por evento', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 3));
    expect(tg.all('Treasure')).toHaveLength(3);
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('na sua etapa final, se você ganhou vida neste turno, compra uma carta', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 1, null);
    tg.passTo('end', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    const sem = setup({ battlefield: [[N], []] });
    sem.passTo('end', 0);
    sem.resolveAll();
    expect(sem.names(0, 'hand')).toHaveLength(0);
  });
});
