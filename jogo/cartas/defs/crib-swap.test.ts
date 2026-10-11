import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Crib Swap';

describe(N, () => {
  it('exila a criatura alvo e o controlador dela cria um Shapeshifter 1/1 com polimorfo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    const ficha = tg.bf('Shapeshifter');
    expect(tg.state.objects[ficha].controller).toBe(1);
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(chars(tg.g, ficha).subtypes).toEqual(expect.arrayContaining(['Cat', 'Dog', 'Elf']));
  });

  it('polimorfo vale em todas as zonas: na mão, a carta é de todos os tipos de criatura', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    const carta = tg.state.zones.hand[0][0];
    expect(chars(tg.g, carta).types.sort()).toEqual(['Instant', 'Kindred']);
    expect(chars(tg.g, carta).subtypes).toEqual(expect.arrayContaining(['Cat', 'Dog', 'Shapeshifter']));
  });

  it('com o alvo ilegal, ninguém cria a ficha', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.all('Shapeshifter')).toHaveLength(0);
  });
});
