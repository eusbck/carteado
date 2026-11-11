import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Sheoldred's Edict";

describe(C, () => {
  it('modo 1: cada oponente sacrifica uma criatura que não seja ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Wall of Omens']], hand: [[C], []] });
    tg.choose('modo', ['Cada oponente sacrifica uma criatura que não seja ficha.']).cast(C).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
