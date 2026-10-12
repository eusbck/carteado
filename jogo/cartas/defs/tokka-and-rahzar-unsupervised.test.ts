import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Tokka & Rahzar, Unsupervised';

describe(N, () => {
  it('iniciativa; outra criatura sua que não é ficha saindo do campo dá um marcador e um Treasure, só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'first strike')).toBe(true);
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    removeCard(tg, tg.bf('Elvish Mystic'));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});