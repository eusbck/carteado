import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Heroes in a Half Shell';

describe(N, () => {
  it('um gatilho por jogador que tomou dano; cada um põe marcador só nas criaturas que causaram dano a esse jogador', () => {
    const tg = setup({ players: 3, battlefield: [[N, "April O'Neil, Live on the Scene", 'Lita, Little Orphan Amphibian'], [], []], library: [['Island', 'Island', 'Island'], ['Island'], ['Island']] });
    for (const kw of ['vigilance', 'menace', 'trample', 'haste']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    // April é Human Detective: causa dano, mas não conta
    tg.attack([[N, 1], ['Lita, Little Orphan Amphibian', 2], ["April O'Neil, Live on the Scene", 2]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    expect(tg.pt(tg.bf('Lita, Little Orphan Amphibian'))).toEqual([3, 2]);
    expect(tg.pt(tg.bf("April O'Neil, Live on the Scene"))).toEqual([2, 1]);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });
});