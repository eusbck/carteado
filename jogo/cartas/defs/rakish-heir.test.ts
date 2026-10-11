import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rakish Heir';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('o Vampire seu que causa dano de combate a um jogador ganha um marcador +1/+1; outra criatura não', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.attack([[N, 1], ['Vampire Nighthawk', 1], ['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([3, 4]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});
