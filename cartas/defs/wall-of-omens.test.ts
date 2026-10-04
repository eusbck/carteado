import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wall of Omens', () => {
  it('ao entrar, compra uma carta', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 702.3b: defensor não pode atacar', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Wall of Omens'], []] });
    tg.pass();
    expect(tg.state.combat?.attackers.length ?? 0).toBe(0);
    expect(tg.state.turn.step).not.toBe('declareBlockers');
  });
});
