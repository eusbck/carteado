import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const planicies = (n: number) => Array(n).fill('Plains');

describe('Martial Coup', () => {
  it('com X = 4, cria quatro Soldiers 1/1 brancos e não destrói nada', () => {
    const tg = setup({ battlefield: [[...planicies(6), 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Martial Coup'], []] });
    tg.number('valor de X', 4).cast('Martial Coup').resolve();
    const soldados = tg.all('Soldier');
    expect(soldados.length).toBe(4);
    expect(tg.pt(soldados[0])).toEqual([1, 1]);
    expect(chars(tg.g, soldados[0]).colors).toEqual(['W']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });

  it('com X = 5, cria os Soldiers e destrói todas as outras criaturas', () => {
    const tg = setup({
      battlefield: [[...planicies(7), 'Wall of Omens', { name: 'Soldier', token: true }], ['Indomitable Ancients', 'Elvish Mystic']],
      hand: [['Martial Coup'], []],
    });
    tg.number('valor de X', 5).cast('Martial Coup').resolve();
    // as cinco fichas novas ficam; o Soldier que já existia é "outra criatura"
    expect(tg.all('Soldier').length).toBe(5);
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Martial Coup', 'Wall of Omens']);
  });
});
