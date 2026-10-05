import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Midnight Banshee', () => {
  it('na sua manutenção, -1/-1 em cada criatura não preta (de todos)', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Midnight Banshee', 'Wall of Omens'], ['Elvish Mystic', 'Gau, Feral Youth']], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.pt(tg.bf('Midnight Banshee'))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(tg.bf('Gau, Feral Youth'))).toEqual([1, 1]);
  });
});
