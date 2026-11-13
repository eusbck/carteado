import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Field of the Dead";

describe(C, () => {
  it('com sete terrenos de nomes diferentes, cria Zombie', () => {
    const tg = setup({ battlefield: [['Forest', 'Island', 'Swamp', 'Mountain', 'Plains', 'Strip Mine'], []], hand: [[C], []] });
    tg.play(C).resolveAll();
    expect(tg.all('Zombie').length).toBe(1);
  });
});
