import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Keeper of Fables';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('dano de combate a dois jogadores ao mesmo tempo dá uma compra para cada jogador', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Silver Myr', 'Indomitable Ancients'], [], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
    // dois não Humanos no Bruno (uma compra só) e um na Carla (outra)
    tg.attack([[N, 1], ['Silver Myr', 1], ['Indomitable Ancients', 2]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('criatura Humana não conta', () => {
    // Spellbinding Soprano é Human Bard
    const tg = setup({ battlefield: [[N, 'Spellbinding Soprano'], []], library: [lib, lib] });
    tg.attack([['Spellbinding Soprano', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});
