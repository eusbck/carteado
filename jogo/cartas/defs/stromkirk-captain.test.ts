import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stromkirk Captain';

describe(N, () => {
  it('iniciativa; as outras criaturas Vampire suas recebem +1/+1 e têm iniciativa', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], ['Vampire Nighthawk']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'first strike')).toBe(true);
    const meu = tg.bf('Vampire Nighthawk', 0);
    expect(tg.pt(meu)).toEqual([3, 4]);
    expect(hasKw(tg.g, meu, 'first strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'first strike')).toBe(false);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 1))).toEqual([2, 3]);
  });
});
