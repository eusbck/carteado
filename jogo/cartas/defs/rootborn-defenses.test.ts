import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rootborn Defenses';

describe(N, () => {
  it('popula e as criaturas que você controla, inclusive a ficha nova, ganham indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Silver Myr', { name: 'Horse', token: true }], ['Elvish Mystic']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const cavalos = tg.all('Horse');
    expect(cavalos).toHaveLength(2);
    for (const id of [...cavalos, tg.bf('Silver Myr')]) expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'indestructible')).toBe(false);
  });
});