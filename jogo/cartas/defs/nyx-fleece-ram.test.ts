import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Nyx-Fleece Ram', () => {
  it('na sua manutenção, ganha 1 de vida (e só na sua)', () => {
    const tg = setup({ step: 'end', battlefield: [['Nyx-Fleece Ram'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'draw');
    expect(tg.life(0)).toBe(40);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.life(0)).toBe(41);
  });
});
