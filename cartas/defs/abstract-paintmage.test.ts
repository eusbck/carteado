import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Abstract Paintmage', () => {
  it('na primeira fase principal adiciona {U}{R} só para instantâneas e feitiços', () => {
    const tg = setup({ step: 'draw', battlefield: [['Abstract Paintmage'], ['Elvish Mystic']], hand: [['Abrade', 'Ashling, Rekindled // Ashling, Rimebound'], []], library: [['Island'], []] });
    tg.passUntil((x) => x.state.turn.step === 'main1' && x.state.zones.stack.length === 1).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type).sort()).toEqual(['R', 'U']);
    expect(tg.canCast('Ashling, Rekindled // Ashling, Rimebound')).toBe(false); // criatura
    expect(tg.canCast('Abrade')).toBe(true);
  });
});
