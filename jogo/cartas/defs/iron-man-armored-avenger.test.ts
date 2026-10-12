import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Iron Man, Armored Avenger';

describe(N, () => {
  it('cada compra sua põe um marcador +1/+1 na criatura alvo; atacando, as outras atacantes modificadas ganham voar', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers', 0);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'flying')).toBe(false);
  });
});