import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Darien, King of Kjeldor';

describe(NOME, () => {
  it('recebendo 2 de dano de combate, cria duas fichas Soldier 1/1', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.yes('Darien', true);
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(38);
    expect(tg.all('Soldier').length).toBe(2);
  });
  it('pode recusar', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.yes('Darien', false);
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.all('Soldier').length).toBe(0);
  });
});
