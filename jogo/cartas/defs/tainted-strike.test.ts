import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tainted Strike';

describe(N, () => {
  it('a criatura alvo recebe +1/+0 e infectar: o dano ao jogador vira marcadores de veneno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Serra Angel'], []], hand: [[N], []] });
    const vida = tg.life(1);
    tg.choose('criatura alvo', ['Serra Angel']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([5, 4]);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida);
    expect(tg.state.players[1].counters.poison).toBe(5);
  });
});