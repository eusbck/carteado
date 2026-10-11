import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Glass-Cast Heart';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('um Blood por ataque com um ou mais Vampires; {B}, {T}, 1 de vida: um Vampire 1/1 com vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Stromkirk Condemned', 'Swamp'], []], library: [lib, lib] });
    tg.attack([['Vampire Nighthawk', 1], ['Stromkirk Condemned', 1]]).passTo('main2', 0);
    expect(tg.all('Blood')).toHaveLength(1);
    tg.activate(N, 'Pague 1 de vida').resolveAll();
    const ficha = tg.bf('Vampire');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(hasKw(tg.g, ficha, 'lifelink')).toBe(true);
  });

  it('{B}{B}, {T}, sacrificar o artefato e treze Blood: cada oponente perde 13 e você ganha 13', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Swamp', 'Swamp'], [], []], library: [lib, lib, lib] });
    runEffect(tg, createTokens(tg.g, 0, 'Blood', 12));
    expect(() => tg.activate(N, 'treze fichas')).toThrow();
    runEffect(tg, createTokens(tg.g, 0, 'Blood', 1));
    tg.activate(N, 'treze fichas').resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([53, 27, 27]);
    expect(tg.all('Blood')).toHaveLength(0);
    expect(tg.find(N)).toBeNull();
  });
});
