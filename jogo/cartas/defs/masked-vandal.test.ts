import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Masked Vandal';

describe(N, () => {
  it('exilando uma carta de criatura do seu cemitério, exila o artefato ou encantamento alvo de um oponente', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']], graveyard: [['Elvish Mystic', 'Hex'], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).choose('Masked Vandal', ['Elvish Mystic']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([1, 3]);
    expect(chars(tg.g, id).subtypes).toEqual(expect.arrayContaining(['Cat', 'Dog']));
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
  });

  it('sem exilar a carta de criatura, o alvo fica', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']], graveyard: [['Elvish Mystic'], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).choose('Masked Vandal', ['Não exilar']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });
});
