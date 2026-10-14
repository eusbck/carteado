import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Indomitable Archangel';

describe(N, () => {
  it('metalurgia: com três artefatos, os seus artefatos têm manto e não podem ser alvo de ninguém', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Gold Myr', "Cultivator's Caravan", 'Plains', 'Plains'], ['Forest', 'Forest']], hand: [['Thrashing Brontodon'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'shroud')).toBe(true);
    expect(hasKw(tg.g, tg.bf(N), 'shroud')).toBe(false);
    const dois = setup({ battlefield: [[N, 'Sol Ring', 'Gold Myr'], []] });
    expect(hasKw(dois.g, dois.bf('Sol Ring'), 'shroud')).toBe(false);
  });

  it('o oponente não consegue mirar o artefato com manto', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Gold Myr', "Cultivator's Caravan"], ['Thrashing Brontodon', 'Forest']] });
    tg.pass();
    expect(() => tg.activate('Thrashing Brontodon')).toThrow();
  });
});
