import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Strip Mine';

describe(NOME, () => {
  it('{T}: adicione {C}', () => {
    expect(alternativasDeMana(NOME)).toEqual(['C']);
  });
  it('{T}, sacrifique: destrua o terreno alvo (também básico)', () => {
    const tg = setup({ battlefield: [[NOME], ['Forest']] });
    tg.choose('terreno alvo', ['Forest']).activate(NOME, 'Destrua').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
