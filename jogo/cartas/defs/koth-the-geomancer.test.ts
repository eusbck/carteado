import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Koth, the Geomancer";

describe(C, () => {
  it('Mountain que entra dá {R} e causa 1', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Mountain'], []] });
    tg.play('Mountain').resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.state.players[0].manaPool.length).toBe(1);
  });
});
