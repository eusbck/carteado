import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Accursed Marauder";

describe(C, () => {
  it('cada jogador sacrifica uma criatura que não seja ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Wall of Omens']], hand: [[C], []] });
    tg.cast(C).resolve().resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
