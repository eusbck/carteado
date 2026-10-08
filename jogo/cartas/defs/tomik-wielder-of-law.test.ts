import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tomik, Wielder of Law', () => {
  it('dois atacando você: o atacante perde 3 e você compra', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Tomik, Wielder of Law'], ['Gau, Feral Youth', 'Elvish Mystic'], []], library: [['Island'], ['Island'], ['Island']] });
    tg.attack([['Gau, Feral Youth', 0], ['Elvish Mystic', 0]]).passTo('declareAttackers').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('um em você e um em outro jogador: nada', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Tomik, Wielder of Law'], ['Gau, Feral Youth', 'Elvish Mystic'], []], library: [['Island'], ['Island'], ['Island']] });
    tg.attack([['Gau, Feral Youth', 0], ['Elvish Mystic', 2]]).passTo('declareAttackers').resolveAll();
    expect(tg.life(1)).toBe(40);
  });
});
