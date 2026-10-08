import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Squee, Goblin Nabob', () => {
  it('na sua manutenção, pode voltar do cemitério para a mão', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[], []], graveyard: [['Squee, Goblin Nabob'], []], library: [['Island'], ['Island']] });
    tg.yes('Squee', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Squee, Goblin Nabob']);
  });
  it('só dispara se estiver no cemitério no início da manutenção', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Squee, Goblin Nabob'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
