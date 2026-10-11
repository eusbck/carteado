import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Anowon, the Ruin Sage';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('na sua manutenção, cada jogador sacrifica uma criatura que não é Vampire; quem só tem Vampires não sacrifica', () => {
    const tg = setup({ active: 1, players: 3, battlefield: [[N, 'Vampire Nighthawk'], ['Elvish Mystic', 'Vampire Nighthawk'], ['Silver Myr', 'Indomitable Ancients']], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
    tg.choose('Sacrifique', ['Silver Myr']);
    tg.passTo('main1', 0);
    expect(tg.names(0, 'battlefield').sort()).toEqual([N, 'Vampire Nighthawk'].sort());
    expect(tg.names(1, 'battlefield')).toEqual(['Vampire Nighthawk']);
    expect(tg.names(2, 'battlefield')).toEqual(['Indomitable Ancients']);
  });
});
