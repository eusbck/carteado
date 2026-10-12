import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bebop, Skull & Crossbones';

describe(N, () => {
  it('toque mortífero; causando dano de combate a um jogador, você pode comprar X cartas e perder X de vida, X = marcadores nele', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    const [eu, ele] = [tg.life(0), tg.life(1)];
    tg.yes('Bebop', true).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect([tg.life(0), tg.life(1)]).toEqual([eu - 2, ele - 4]);
  });
});