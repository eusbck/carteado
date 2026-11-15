import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { manaOptions } from '../../motor/costs.ts';

const N = 'Hushwood Verge';

describe(N, () => {
  it('entra desvirado e sempre oferece verde', () => {
    expect(entraVirado(N)).toBe(false);
    expect(alternativasDeMana(N, ['Island', 'Evolving Wilds'])).toEqual(['G']);
  });

  it.each(['Forest', 'Plains', 'Temple Garden', 'Sacred Foundry'])('oferece branco com %s, mesmo sem ser básico', (terreno) => {
    expect(alternativasDeMana(N, [terreno])).toEqual(['G', 'W']);
  });

  it('o terreno do oponente não habilita a mana branca', () => {
    const tg = setup({ battlefield: [[N], ['Forest', 'Plains']] });
    expect(manaOptions(tg.g, 0).filter((opcao) => opcao.obj === tg.bf(N)).map((opcao) => opcao.alt)).toEqual([['G']]);
  });
});
