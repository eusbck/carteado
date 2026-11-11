import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Innocent Blood";

describe(C, () => {
  it('cada jogador sacrifica uma criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Elvish Mystic'], ['Wall of Omens']], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
