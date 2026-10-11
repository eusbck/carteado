import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Typhoid Mary, Fractured';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('tendo descartado no turno, você escolhe o modo', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], hand: [['Hex'], [], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    runEffect(tg, discard(tg.g, 0, 1));
    tg.choose('Typhoid Mary', ['Bloody Mary — Cada oponente perde 2 de vida e você ganha 2 de vida']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([42, 35, 38]);
  });

  it('sem descarte no turno, um dos três modos é sorteado (sementes diferentes dão modos diferentes)', () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 16; i++) {
      const tg = setup({ seed: `mary-${i}`, battlefield: [[N], []], library: [lib, lib] });
      tg.attack([[N, 1]]).passTo('main2', 0);
      const tesouro = tg.all('Treasure').length;
      const mao = tg.names(0, 'hand').length;
      const sangue = tg.life(0) === 42;
      expect(tesouro + mao + (sangue ? 1 : 0)).toBe(1);
      expect(tg.life(1)).toBe(sangue ? 35 : 37);
      vistos.add(tesouro ? 'mary' : mao ? 'typhoid' : 'bloody');
    }
    expect(vistos.size).toBe(3);
  });
});
