import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Monologue Tax', () => {
  it('a primeira mágica conta mesmo antes do encantamento; a terceira mágica não dispara', () => {
    const tg = setup({
      active: 1, battlefield: [['Monologue Tax'], ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp']], hand: [[], ["Night's Whisper", "Night's Whisper", "Night's Whisper"]],
      library: [[], Array(8).fill('Plains')],
    });
    tg.state.turnStats[1].spellsCast = 1; // uma mágica antes de o encantamento estar no campo
    tg.refresh().cast("Night's Whisper").resolveAll();
    expect(tg.all('Treasure').length).toBe(1);
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.all('Treasure').length).toBe(1);
  });
});
