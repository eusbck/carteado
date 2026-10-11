import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Revenge of Ravens';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('cada criatura que ataca você faz o controlador dela perder 1 de vida e você ganhar 1', () => {
    const tg = setup({ active: 1, players: 3, battlefield: [[N], ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients'], []], library: [lib, lib, lib] });
    tg.attack([['Elvish Mystic', 0], ['Silver Myr', 0], ['Indomitable Ancients', 2]]);
    tg.passTo('declareBlockers', 1);
    // duas criaturas atacando você; a terceira ataca outro jogador
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
});
