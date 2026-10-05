import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Stormcatch Mentor', () => {
  it("Night's Whisper ({1}{B}) por {B}; bravura dá +1/+1", () => {
    const tg = setup({ battlefield: [['Stormcatch Mentor', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.pt(tg.bf('Stormcatch Mentor'))).toEqual([2, 2]);
  });
  it('a redução não paga mana colorida', () => {
    const tg = setup({ battlefield: [['Stormcatch Mentor', 'Island'], []], hand: [["Night's Whisper"], []] });
    expect(tg.canCast("Night's Whisper")).toBe(false);
  });
});
