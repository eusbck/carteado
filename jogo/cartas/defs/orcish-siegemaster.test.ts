import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Orcish Siegemaster';
const lib = Array(8).fill('Mountain');

describe(N, () => {
  it('atropelar; os outros Orcs e Goblins seus têm atropelar; ao atacar, +X/+0 pela maior força entre as suas criaturas', () => {
    const tg = setup({ battlefield: [[N, 'Guttersnipe', 'Elvish Mystic', 'Knollspine Dragon'], ['Guttersnipe']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([0, 5]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Guttersnipe', 0), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'trample')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Guttersnipe', 1), 'trample')).toBe(false);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    // a maior força é a do Knollspine Dragon (7)
    expect(tg.pt(id)).toEqual([7, 5]);
  });
});
