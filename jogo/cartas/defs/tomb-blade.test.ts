import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tomb Blade';

describe(N, () => {
  it('voar; quem leva o dano de combate perde vida igual ao número de criaturas que controla', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr', 'Wall of Omens']] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    const vida = tg.life(1);
    tg.yes('Tomb Blade', false).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 5 - 3);
  });

  it('a menos que sacrifique uma criatura', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr']] });
    const vida = tg.life(1);
    tg.yes('Tomb Blade', true).choose('Sacrifique uma criatura', ['Elvish Mystic']).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 5);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});