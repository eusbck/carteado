import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tymna the Weaver';

describe(N, () => {
  it('na fase principal pós-combate, paga X de vida e compra X cartas, X = oponentes que receberam dano de combate no turno', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Serra Angel', 'Indomitable Ancients'], [], []], library: [Array(4).fill('Island'), ['Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    const vida = tg.life(0);
    tg.yes('Tymna', true).attack([['Serra Angel', 1], ['Indomitable Ancients', 2]]).passTo('main2', 0).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.life(0)).toBe(vida - 2);
  });

  it('sem dano de combate a oponentes, não oferece nada', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(3).fill('Island'), ['Island']] });
    tg.passTo('main2', 0).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});