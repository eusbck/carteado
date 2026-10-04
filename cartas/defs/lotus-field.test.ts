import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado, temPalavrasChave } from '../../testes/padroes.ts';

describe('Lotus Field', () => {
  it('três manas de uma mesma cor; resistência a magia; entra virado', () => {
    expect(alternativasDeMana('Lotus Field')).toEqual(['BBB', 'GGG', 'RRR', 'UUU', 'WWW']);
    expect(temPalavrasChave('Lotus Field', 'hexproof')).toBe(true);
    expect(entraVirado('Lotus Field', ['Plains', 'Plains'])).toBe(true);
  });
  it('ao entrar, sacrifica dois terrenos', () => {
    const tg = setup({ battlefield: [['Plains', 'Island', 'Forest'], []], hand: [['Lotus Field'], []] });
    tg.choose('dois terrenos', ['Plains', 'Island']).play('Lotus Field').resolve();
    expect(tg.names(0, 'battlefield').sort()).toEqual(['Forest', 'Lotus Field']);
  });
  it('com menos de dois outros terrenos, sacrifica todos, inclusive ele', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [['Lotus Field'], []] });
    tg.play('Lotus Field').resolve();
    expect(tg.names(0, 'battlefield')).toEqual([]);
  });
});
