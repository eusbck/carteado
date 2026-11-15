import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { activateMana } from '../../testes/artefatos.ts';

const N = 'Blazemire Verge';

describe(N, () => {
  it('entra desvirado e produz preto sem outro terreno', () => {
    expect(entraVirado(N)).toBe(false);
    expect(alternativasDeMana(N)).toEqual(['B']);
  });
  it('produz vermelho com Swamp ou Mountain, inclusive terreno não básico com esses tipos', () => {
    for (const terreno of ['Swamp', 'Mountain', 'Blood Crypt']) expect(alternativasDeMana(N, [terreno])).toEqual(['B', 'R']);
    expect(alternativasDeMana(N, ['Forest', 'Command Tower'])).toEqual(['B']);
  });
  it('ignora tipos de terrenos dos oponentes', () => {
    const tg = setup({ battlefield: [[N], ['Swamp', 'Mountain']] });
    expect(() => activateMana(tg, N, 'R')).toThrow('Habilidade de mana indisponível');
    activateMana(tg, N, 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
  });
});
