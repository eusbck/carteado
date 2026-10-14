import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Anya, Merciless Angel';

describe(NOME, () => {
  it('com 20 de vida (vida inicial 40) não conta; com 19 conta: +3/+3 e indestrutível', () => {
    const tg = setup({ players: 3, battlefield: [[NOME], [], []] });
    const a = tg.bf(NOME);
    expect(tg.pt(a)).toEqual([4, 4]);
    expect(hasKw(tg.g, a, 'flying')).toBe(true);
    tg.state.players[1].life = 20;
    tg.g.bump();
    expect(tg.pt(a)).toEqual([4, 4]);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(false);
    tg.state.players[1].life = 19;
    tg.g.bump();
    expect(tg.pt(a)).toEqual([7, 7]);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(true);
    tg.state.players[2].life = 5;
    tg.g.bump();
    expect(tg.pt(a)).toEqual([10, 10]);
  });
});
