import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shadowspear';

describe(N, () => {
  it('a equipada recebe +1/+1, atropelar e vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens'], []] });
    attach(tg.g, tg.bf(N), tg.bf('Wall of Omens'));
    tg.refresh();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    for (const kw of ['trample', 'lifelink']) expect(hasKw(tg.g, tg.bf('Wall of Omens'), kw)).toBe(true);
  });

  it('{1}: as permanentes dos oponentes perdem resistência a magia e indestrutível, mesmo sem a lança equipada', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Captain Marvel, Apex Avenger'], ['Captain Marvel, Apex Avenger']] });
    tg.activate(N, 'perdem').resolveAll();
    expect(hasKw(tg.g, tg.bf('Captain Marvel, Apex Avenger', 1), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Captain Marvel, Apex Avenger', 0), 'indestructible')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Captain Marvel, Apex Avenger', 1), 'indestructible')).toBe(true);
  });
});