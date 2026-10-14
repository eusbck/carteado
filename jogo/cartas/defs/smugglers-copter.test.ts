import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = "Smuggler's Copter";

describe(N, () => {
  it('tripulado, vira criatura artefato 3/3 voadora; ao atacar, compra e descarta', () => {
    const tg = fixture({ battlefield: [[N, { name: 'Elvish Mystic', ready: false }], []], hand: [['Plains'], []] });
    expect(chars(tg.g, tg.bf(N)).types).not.toContain('Creature');
    tg.choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    const v = tg.bf(N);
    expect(chars(tg.g, v).types).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(v)).toEqual([3, 3]);
    expect(hasKw(tg.g, v, 'flying')).toBe(true);
    tg.yes("Smuggler's Copter", true).choose('escarte', ['Plains']);
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
  });
});
