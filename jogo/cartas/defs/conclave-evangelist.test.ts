import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Conclave Evangelist';

describe(N, () => {
  it('com um oponente só, a miríade não cria fichas; o dano de combate cria uma cópia que fica', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.all(N)).toHaveLength(1);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.all(N)).toHaveLength(2);
    tg.passTo('upkeep', 1);
    expect(tg.all(N)).toHaveLength(2);
  });

  it('com três jogadores, a cópia da miríade é exilada no fim do combate, e as cópias criadas pelo dano ficam', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    tg.yes('Miríade', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.life(2)).toBe(36);
    // a original, a cópia criada pelo dano dela e a cópia criada pelo dano da ficha da miríade (esta já exilada)
    expect(tg.all(N)).toHaveLength(3);
  });
});