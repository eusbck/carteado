import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sanctum Seeker';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('cada Vampire seu que ataca faz cada oponente perder 1 de vida e você ganhar 1', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], [], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 4]);
    tg.attack([[N, 1], ['Vampire Nighthawk', 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    // dois Vampires atacando: dois gatilhos
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([42, 38, 38]);
  });
});
