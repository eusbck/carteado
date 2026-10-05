import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Blossoming Bogbeast', () => {
  it('X conta toda a vida ganha no turno, sem descontar a perdida', () => {
    const tg = setup({ battlefield: [['Blossoming Bogbeast', 'Elvish Mystic'], []] });
    tg.state.turnStats[0].lifeGained = 3;
    tg.state.turnStats[0].lifeLost = 3;
    tg.attack([['Blossoming Bogbeast', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([6, 6]);
    expect(hasKw(tg.g, tg.bf('Blossoming Bogbeast'), 'trample')).toBe(true);
    expect(tg.life(0)).toBe(42);
  });
});
