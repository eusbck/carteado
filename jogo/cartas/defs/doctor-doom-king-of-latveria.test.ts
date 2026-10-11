import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Doctor Doom, King of Latveria';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('descartando uma ou mais cartas de terreno de uma vez, cada oponente perde 2 de vida, uma vez só', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], hand: [['Swamp', 'Swamp', 'Hex'], [], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('Descarte', ['Swamp', 'Swamp']);
    runEffect(tg, discard(tg.g, 0, 2));
    tg.resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
    // carta que não é terreno não dispara
    runEffect(tg, discard(tg.g, 0, 1));
    tg.resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
  });

  it('no início do combate, o Villain alvo ganha ameaçar e trama; descartando terreno, os oponentes perdem 2', () => {
    const tg = setup({ battlefield: [[N, 'The Frightful Four'], []], hand: [['Hex'], []], library: [lib, lib] });
    const alvo = tg.bf(N);
    tg.choose('Villain alvo', [N]).choose('Descarte', ['Swamp']);
    tg.passTo('declareAttackers');
    expect(hasKw(tg.g, alvo, 'menace')).toBe(true);
    expect(tg.state.objects[alvo].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
  });
});
