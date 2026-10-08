import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Eldrazi Conscription', () => {
  it('+10/+10, atropelar; o defensor sacrifica dois permanentes na declaração de atacantes, antes de bloquear', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', { name: 'Eldrazi Conscription', attachTo: 'Elvish Mystic' }], ['Wall of Omens', 'Sol Ring', 'Island']] });
    const m = tg.bf('Elvish Mystic');
    expect(tg.pt(m)).toEqual([11, 11]);
    expect(hasKw(tg.g, m, 'trample')).toBe(true);
    tg.choose('Aniquilador 2', ['Wall of Omens', 'Sol Ring']);
    tg.attack([['Elvish Mystic', 1]]).passTo('combatDamage');
    expect(tg.names(1, 'battlefield')).toEqual(['Island']);
    expect(tg.life(1)).toBe(29);
  });
});
