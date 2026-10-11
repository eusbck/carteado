import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Boros Guildmage';

describe(N, () => {
  it('{1}{R}: ímpeto; {1}{W}: iniciativa, até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Plains', 'Plains', 'Indomitable Ancients'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    const a = tg.bf('Indomitable Ancients');
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, '{1}{R}').resolveAll();
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, '{1}{W}').resolveAll();
    expect(hasKw(tg.g, a, 'haste')).toBe(true);
    expect(hasKw(tg.g, a, 'first strike')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, a, 'haste')).toBe(false);
    expect(hasKw(tg.g, a, 'first strike')).toBe(false);
  });
});