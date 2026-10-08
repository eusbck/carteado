import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Anger', () => {
  it('no cemitério, com uma Mountain, suas criaturas têm ímpeto', () => {
    const tg = setup({ battlefield: [['Mountain', { name: 'Indomitable Ancients', ready: false }], ['Wall of Omens']], graveyard: [['Anger'], []] });
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'haste')).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(38);
  });
  it('sem Mountain, ou com Anger fora do cemitério, nada', () => {
    const tg = setup({ battlefield: [['Plains', 'Indomitable Ancients'], []], graveyard: [['Anger'], []] });
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(false);
    const tg2 = setup({ battlefield: [['Mountain', 'Indomitable Ancients'], []], hand: [['Anger'], []] });
    expect(hasKw(tg2.g, tg2.bf('Indomitable Ancients'), 'haste')).toBe(false);
  });
});
