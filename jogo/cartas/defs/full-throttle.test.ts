import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Full Throttle';

describe(C, () => {
  it('depois da fase principal vêm dois combates a mais, e quem atacou desvira no início de cada um', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Mountain'), { name: 'Elvish Mystic', ready: true }], []], hand: [[C], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.cast(C).resolve();
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.passTo('beginCombat');
    expect(tg.state.turn.combatCount).toBe(2);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    expect(tg.life(1)).toBe(39);
  });
});
