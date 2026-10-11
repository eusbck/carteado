import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Righteous Cause';

describe(N, () => {
  it('você ganha 1 de vida para cada criatura que ataca, sua ou dos outros', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Silver Myr'], ['Elvish Mystic']] });
    tg.attack([['Indomitable Ancients', 1], ['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.life(0)).toBe(42);
    tg.attack([['Elvish Mystic', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(42);
  });
});