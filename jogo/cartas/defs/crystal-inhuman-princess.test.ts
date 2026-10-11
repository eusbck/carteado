import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Crystal, Inhuman Princess';

describe(N, () => {
  it('causa a cada oponente dano igual ao número de cores da mágica que não é de criatura', () => {
    // Maestros Charm tem três cores; Preordain, uma; Sol Ring, nenhuma
    const tg = setup({ players: 3, battlefield: [[N, 'Island', 'Swamp', 'Mountain', 'Island', 'Island'], [], []], hand: [['Maestros Charm', 'Preordain', 'Sol Ring'], [], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.choose('modo', ['Cada oponente perde 3 de vida e você ganha 3 de vida']).cast('Maestros Charm').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([34, 34]);
    tg.cast('Preordain').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([33, 33]);
    tg.cast('Sol Ring').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([33, 33]);
  });

  it('{T}: adiciona {R}, {G}, {W} ou {U}', () => {
    for (const cor of ['R', 'G', 'W', 'U']) {
      const tg = setup({ battlefield: [[N], []] });
      activateMana(tg, N, cor);
      expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual([cor]);
    }
  });
});
