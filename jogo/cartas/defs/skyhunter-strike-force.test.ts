import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skyhunter Strike Force';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('corpo a corpo: +1/+1 por oponente atacado; com o seu comandante no campo, as outras criaturas também têm', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic', 'Silver Myr'], [], []], library: [lib, lib, lib] });
    const id = tg.bf(N);
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'melee')).toBe(true);
    // sem comandante no campo, as outras não têm
    expect(hasKw(tg.g, elfo, 'melee')).toBe(false);
    tg.state.cards[tg.state.objects[tg.bf('Silver Myr')].card!].isCommander = true;
    tg.refresh();
    expect(hasKw(tg.g, elfo, 'melee')).toBe(true);
    tg.attack([[N, 1], [elfo, 2]]).passTo('declareBlockers');
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(tg.pt(elfo)).toEqual([3, 3]);
  });
});
