import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Crossway Troublemakers';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('os seus Vampires atacantes têm toque mortífero e vínculo com a vida; os que não atacam, não', () => {
    const tg = setup({ battlefield: [[N, 'Stromkirk Condemned', 'Elvish Mystic'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(false);
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, id, 'deathtouch') && hasKw(tg.g, id, 'lifelink')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Stromkirk Condemned'), 'lifelink')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(false);
    tg.passTo('main2', 0);
    expect([tg.life(0), tg.life(1)]).toEqual([45, 34]);
  });

  it('quando um Vampire seu morre, pagando 2 de vida você compra uma carta, uma vez por Vampire', () => {
    const tg = setup({ battlefield: [[N, 'Stromkirk Condemned', 'Elvish Mystic'], []], library: [lib, lib] });
    tg.yes('Crossway Troublemakers', true);
    tg.run(destroy(tg.g, [tg.bf('Stromkirk Condemned'), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.life(0)).toBe(38);
  });
});
