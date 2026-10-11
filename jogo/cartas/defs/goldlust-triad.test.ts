import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Goldlust Triad';

describe(N, () => {
  it('miríade cria uma cópia atacando cada outro oponente; as cópias causam dano, criam Treasure e são exiladas no fim do combate', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [[], ['Island'], ['Island']] });
    tg.yes('Miríade', true).attack([[N, 1]]);
    tg.passTo('declareBlockers');
    // a original e uma cópia, virada e atacando o outro oponente (não foi declarada: a miríade dela não dispara)
    expect(tg.all(N)).toHaveLength(2);
    tg.passTo('main2');
    // 4 de dano de combate em cada oponente e um Treasure por golpe
    expect([tg.life(1), tg.life(2)]).toEqual([36, 36]);
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.all(N)).toHaveLength(1);
  });

  it('com um oponente só, a miríade não cria fichas', () => {
    const tg = setup({ battlefield: [[N], []], library: [[], ['Island']] });
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.all(N)).toHaveLength(1);
    expect(tg.life(1)).toBe(36);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});
