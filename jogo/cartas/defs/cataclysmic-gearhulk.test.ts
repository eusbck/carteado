import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Cataclysmic Gearhulk';

describe(N, () => {
  it('cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Gold Myr', 'Ripjaw Raptor', 'Forest'], ['Elvish Mystic', 'Indomitable Ancients', 'Colossal Majesty', 'Island']] });
    // Ana escolhe o Gold Myr como artefato (ele é criatura também) e o Raptor como criatura: o Gearhulk e o Sol Ring vão
    tg.choose('escolha um artefato', ['Gold Myr']);
    tg.choose('escolha uma criatura', ['Ripjaw Raptor']);
    tg.choose('escolha uma criatura', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'battlefield').sort()).toEqual(['Forest', 'Gold Myr', 'Ripjaw Raptor']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Sol Ring'].sort());
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Colossal Majesty', 'Indomitable Ancients', 'Island']);
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
  });
});
