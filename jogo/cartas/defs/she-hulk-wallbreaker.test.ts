import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'She-Hulk, Wallbreaker';

describe(N, () => {
  it('atropelar para ela e os outros Heroes seus; o Hero bloqueado ganha um marcador +1/+1 por bloqueadora', () => {
    const tg = setup({ battlefield: [[N, 'Patriot, Shield Wielder', 'Silver Myr'], ['Wall of Omens', 'Indomitable Ancients']] });
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Patriot, Shield Wielder'), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'trample')).toBe(false);
    tg.attack([[N, 1]]).block([['Wall of Omens', N], ['Indomitable Ancients', N]]).passTo('declareBlockers', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
  });
});