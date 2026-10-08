import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Inkshield', () => {
  it('previne o dano de combate e cria uma Inkling por ponto prevenido', () => {
    const tg = setup({
      active: 1, battlefield: [['Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'], ['Gau, Feral Youth', 'Glissa Sunslayer']], hand: [['Inkshield'], []],
      library: [['Island'], ['Island']],
    });
    tg.choose('escolha 1 modo', ['Você compra uma carta e perde 1 de vida']);
    tg.attack([['Gau, Feral Youth', 0], ['Glissa Sunslayer', 0]]).passTo('declareBlockers');
    tg.pass();
    tg.cast('Inkshield').resolve();
    tg.passTo('main2');
    expect(tg.life(0)).toBe(40);
    expect(tg.all('Inkling').length).toBe(6);
  });
});
