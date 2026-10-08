import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Night's Whisper", () => {
  it('você compra duas cartas e perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Plains', 'Island', 'Forest'], []] });
    tg.cast("Night's Whisper").resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Island']);
    expect(tg.life(0)).toBe(38);
  });
});
