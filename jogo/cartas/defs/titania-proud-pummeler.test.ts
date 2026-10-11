import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Titania, Proud Pummeler';

describe(N, () => {
  it('iniciativa e corpo a corpo: +1/+1 por oponente atacado; as outras criaturas suas também têm corpo a corpo', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic'], []] });
    const id = tg.bf(N);
    const elfo = tg.bf('Elvish Mystic', 0);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'first strike') && hasKw(tg.g, id, 'melee')).toBe(true);
    expect(hasKw(tg.g, elfo, 'melee')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic', 1), 'melee')).toBe(false);
    // dois oponentes atacados: cada atacante recebe +2/+2
    tg.attack([[N, 1], [elfo, 2]]).passTo('declareBlockers');
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(tg.pt(elfo)).toEqual([3, 3]);
  });
});
