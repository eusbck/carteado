import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Bolas's Citadel";

describe(C, () => {
  it('conjura do topo pagando vida igual ao valor de mana', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Wall of Omens', 'Opt'], []] });
    expect(tg.canCast('Wall of Omens')).toBe(true);
    tg.cast('Wall of Omens', `perm:citadel:${tg.bf(C)}`).resolveAll();
    expect(tg.life(0)).toBe(38);
  });
});
