import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Defiling Daemogoth', () => {
  it('dano de combate de criatura sua a jogador: ganha 1; X conta na resolução', () => {
    const tg = setup({ players: 3, battlefield: [['Defiling Daemogoth', 'Elvish Mystic'], [], []], library: [[], ['Island'], ['Island']] });
    tg.attack([['Defiling Daemogoth', 1], ['Elvish Mystic', 2]]).passTo('main2');
    expect(tg.life(0)).toBe(42);
    tg.state.turnStats[0].lifeGained += 1; // mais 1 antes da etapa final
    tg.passTo('end');
    expect([tg.life(1), tg.life(2)]).toEqual([40 - 5 - 3, 40 - 1 - 3]);
  });
});
