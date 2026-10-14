import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Pongify';

describe(N, () => {
  it('destrói a criatura e o controlador dela cria um Ape 3/3; indestrutível, não morre mas o Ape vem', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Indomitable Ancients', 'Brash Taunter']], hand: [[N, N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    const ape = tg.bf('Ape', 1);
    expect(tg.pt(ape)).toEqual([3, 3]);
    expect(chars(tg.g, ape).colors).toEqual(['G']);
    tg.choose('criatura alvo', ['Brash Taunter']).cast(N).resolveAll();
    expect(tg.find('Brash Taunter')).not.toBeNull();
    expect(tg.all('Ape')).toHaveLength(2);
  });

  it('se o alvo fica ilegal, não resolve e ninguém cria o Ape', () => {
    const tg = setup({ battlefield: [['Island', 'Plains'], ['Indomitable Ancients']], hand: [[N, 'Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares').resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Ape')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(expect.arrayContaining([N]));
  });
});
