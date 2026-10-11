import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lady Loki, Agent of Chaos';

describe(N, () => {
  it('exila a primeira mágica de Villain do turno e o topo até uma carta que não é terreno; dano igual à diferença dos valores de mana; conjura a carta de graça', () => {
    // The Frightful Four (valor 4) é exilada; do grimório saem Island e Sol Ring (valor 1): 3 de dano
    const tg = setup({
      players: 3, battlefield: [[N, ...Array(8).fill('Swamp')], [], []], hand: [['The Frightful Four', 'The Frightful Four'], [], []],
      library: [['Island', 'Sol Ring', 'Indomitable Ancients', 'Island'], Array(4).fill('Island'), Array(4).fill('Island')],
    });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    tg.yes('Lady Loki', true);
    tg.cast('The Frightful Four').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([37, 37]);
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('The Frightful Four')).toBeNull();
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', 'The Frightful Four']);
    // a segunda do turno não dispara
    tg.cast('The Frightful Four').resolveAll();
    expect(tg.find('The Frightful Four')).not.toBeNull();
    expect([tg.life(1), tg.life(2)]).toEqual([37, 37]);
  });

  it('mágica de criatura que não é Villain não conta nem gasta a vez', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Swamp'), 'Island', 'Island'], []], hand: [['Silver Myr', 'Sol Ring', 'Preordain'], []], library: [['Sol Ring', 'Island', 'Island'], Array(4).fill('Island')] });
    tg.cast('Silver Myr').resolveAll();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([]);
    // Preordain (feitiço, valor 1) é a primeira que conta: é exilada; Sol Ring do topo (valor 1): diferença 0
    tg.yes('Lady Loki', false);
    tg.cast('Preordain').resolveAll();
    expect(tg.names(0, 'exile').sort()).toEqual(['Preordain', 'Sol Ring']);
    expect(tg.life(1)).toBe(40);
  });
});
