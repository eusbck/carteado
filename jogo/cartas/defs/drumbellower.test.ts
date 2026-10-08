import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Drumbellower', () => {
  it('desvira todas as suas criaturas na etapa de desvirar dos outros', () => {
    const virado = (name: string) => ({ name, tapped: true });
    const tg = setup({ step: 'end', battlefield: [['Drumbellower', virado('Wall of Omens'), virado('Sol Ring'), virado('Plains')], [virado('Elvish Mystic')]], library: [[], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
  });
});
