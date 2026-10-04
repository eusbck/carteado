import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Awakening Zone', () => {
  it('na sua manutenção, pode criar um Eldrazi Spawn', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Awakening Zone'], []], library: [['Island'], ['Island']] });
    tg.yes('Eldrazi Spawn', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.all('Eldrazi Spawn').length).toBe(1);
  });
});
