import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Planetary Annihilation";

describe(C, () => {
  it('6 de dano em cada criatura', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain')], ['Wall of Omens']], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
