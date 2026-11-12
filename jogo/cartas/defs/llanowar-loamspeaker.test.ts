import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Llanowar Loamspeaker', () => {
  it('o terreno vira criatura 3/3 com ímpeto e continua terreno; virado continua virado', () => {
    const tg = setup({ battlefield: [['Llanowar Loamspeaker', { name: 'Forest', tapped: true }], []] });
    const floresta = tg.bf('Forest');
    tg.choose('terreno alvo', [floresta]).activate('Llanowar Loamspeaker', 'Elemental').resolve();
    const c = chars(tg.g, floresta);
    expect(c.types).toEqual(expect.arrayContaining(['Land', 'Creature']));
    expect(c.subtypes).toEqual(expect.arrayContaining(['Forest', 'Elemental']));
    expect(tg.pt(floresta)).toEqual([3, 3]);
    expect(hasKw(tg.g, floresta, 'haste')).toBe(true);
    expect(tg.state.objects[floresta].tapped).toBe(true);
  });
});
