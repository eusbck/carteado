import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Prosperous Thief';

describe(N, () => {
  it('CR 603.2c: um Treasure por jogador atingido por Ninjas ou Rogues, não por criatura', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Universal Automaton', 'Mist-Cloaked Herald', 'Memnite'], [], []] });
    tg.attack([[N, 1], ['Universal Automaton', 1], ['Mist-Cloaked Herald', 2], ['Memnite', 2]]).passTo('main2', 0);
    // jogador 1: dois Ninjas (um Treasure); jogador 2: nem Ninja nem Rogue
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Treasure').length).toBe(1);
  });
});
