import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Shadow, Mysterious Assassin', () => {
  it('usa o valor de mana do permanente sacrificado', () => {
    const tg = setup({ players: 3, battlefield: [['Shadow, Mysterious Assassin', 'Ravenous Chupacabra'], [], []], library: [['Island', 'Island'], [], []] });
    tg.choose('Arremesso', ['Ravenous Chupacabra']);
    tg.attack([['Shadow, Mysterious Assassin', 1]]).passTo('combatDamage');
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.life(1)).toBe(40 - 3 - 4);
    expect(tg.life(2)).toBe(36);
  });
  it('sem sacrificar, nada', () => {
    const tg = setup({ battlefield: [['Shadow, Mysterious Assassin', 'Sol Ring'], []], library: [['Island'], []] });
    tg.choose('Arremesso', []);
    tg.attack([['Shadow, Mysterious Assassin', 1]]).passTo('combatDamage');
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.life(1)).toBe(37);
  });
});
