import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Perforating Artist', () => {
  it('cada oponente escolhe em ordem; tudo acontece junto; o oponente pode escolher perder 3 de vida mesmo tendo cartas', () => {
    const tg = setup({
      players: 4, battlefield: [[{ name: 'Perforating Artist', ready: true }], ['Sol Ring'], [], []], hand: [[], [], ['Plains'], ['Plains']],
      library: [['Island'], ['Island'], ['Island'], ['Island']],
    });
    tg.choose('Perforating Artist: sacrifique', ['Sacrificar Sol Ring']);
    tg.choose('Perforating Artist: sacrifique', ['Descartar Plains']);
    tg.choose('Perforating Artist: sacrifique', ['Perder 3 de vida']);
    tg.attack([['Perforating Artist', 1]]).passTo('end').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(2, 'graveyard')).toEqual(['Plains']);
    expect([tg.life(1), tg.life(2), tg.life(3)]).toEqual([37, 40, 37]);
  });
  it('sem ataque no turno, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [['Perforating Artist'], []], library: [['Island'], ['Island']] });
    tg.passTo('cleanup');
    expect(tg.life(1)).toBe(40);
  });
});
