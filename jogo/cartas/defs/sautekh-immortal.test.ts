import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Sautekh Immortal';

describe(N, () => {
  it('lampejo; entra com um marcador +1/+1 para cada criatura que morreu neste turno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Elvish Mystic']], hand: [[N], []] });
    removeCard(tg, tg.bf('Wall of Omens'));
    removeCard(tg, tg.bf('Elvish Mystic'));
    tg.resolveAll();
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'flash')).toBe(true);
  });
});