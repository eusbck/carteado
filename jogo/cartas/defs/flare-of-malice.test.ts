import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Flare of Malice";

describe(C, () => {
  it('cada oponente sacrifica a criatura de maior valor de mana', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp')], ['Wall of Omens', 'Elvish Mystic']], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
