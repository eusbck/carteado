import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Planet Killer';

describe(N, () => {
  it('ataca obrigatoriamente e, causando dano de combate, recebe um marcador por terreno do jogador', () => {
    const tg = setup({ battlefield: [[N], ['Forest', 'Island', 'Swamp']] });
    tg.passTo('main2', 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(31);
    expect(tg.pt(tg.bf(N))).toEqual([12, 12]);
  });
});
