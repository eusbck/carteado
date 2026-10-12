import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Professor Hulk';

describe(N, () => {
  it('atropelar; causando dano de combate a um jogador, compra essa quantidade de cartas', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(8).fill('Island'), ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(6);
  });
});