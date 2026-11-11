import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Funeral Room // Awakening Hall";

describe(C, () => {
  it('Funeral Room drena quando sua criatura morre', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Memnite'], []], hand: [[C, 'Corrupted Conviction'], []], library: [['Opt', 'Opt'], []] });
    tg.cast(C, '*').resolve();
    tg.choose('Sacrifique', ['Memnite']).cast('Corrupted Conviction').resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
});
