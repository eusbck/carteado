import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Firebird, Blazing Ranger';

describe(N, () => {
  it('voar; atacando, as outras atacantes recebem +X/+0, X = a força dela', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }, 'Indomitable Ancients', 'Wall of Omens'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers', 0);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([4, 10]);
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
});