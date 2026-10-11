import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Maskwood Nexus';

describe(N, () => {
  it('as suas criaturas são de todos os tipos de criatura, no campo e fora dele; as do oponente não', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic']], hand: [['Silver Myr', 'Sol Ring'], ['Silver Myr']], graveyard: [['Indomitable Ancients'], []] });
    expect(chars(tg.g, tg.bf('Elvish Mystic', 0)).subtypes).toEqual(expect.arrayContaining(['Cat', 'Dog', 'Elf']));
    expect(chars(tg.g, tg.bf('Elvish Mystic', 1)).subtypes).not.toContain('Cat');
    const [myr, anel] = tg.state.zones.hand[0];
    expect(chars(tg.g, myr).subtypes).toEqual(expect.arrayContaining(['Cat', 'Myr']));
    // carta que não é de criatura não ganha tipos
    expect(chars(tg.g, anel).subtypes).not.toContain('Cat');
    expect(chars(tg.g, tg.state.zones.graveyard[0][0]).subtypes).toContain('Cat');
    expect(chars(tg.g, tg.state.zones.hand[1][0]).subtypes).not.toContain('Cat');
  });

  it('{3}, {T}: cria um Shapeshifter 2/2 azul com polimorfo', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []] });
    tg.activate(N, '{3}, {T}').resolveAll();
    const ficha = tg.bf('Shapeshifter');
    expect(tg.pt(ficha)).toEqual([2, 2]);
    expect(chars(tg.g, ficha).colors).toEqual(['U']);
    expect(chars(tg.g, ficha).subtypes).toContain('Dog');
  });
});
