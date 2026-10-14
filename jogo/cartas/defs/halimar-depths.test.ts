import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = 'Halimar Depths';

describe(NOME, () => {
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['U']));
  it('ao entrar, olha as três cartas do topo e as põe de volta na ordem que quiser', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Island', 'Forest', 'Swamp', 'Plains'], []] });
    tg.choose('Halimar Depths: ponha as cartas', ['Swamp', 'Island', 'Forest']);
    tg.play(NOME).resolve();
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Island', 'Forest', 'Plains']);
  });
});
