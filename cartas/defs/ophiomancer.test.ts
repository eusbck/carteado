import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Ophiomancer', () => {
  it('em cada manutenção, cria uma Snake preta 1/1 com toque mortífero', () => {
    const tg = setup({ step: 'end', battlefield: [['Ophiomancer'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep').resolve();
    const s = tg.bf('Snake');
    expect(tg.pt(s)).toEqual([1, 1]);
    expect(hasKw(tg.g, s, 'deathtouch')).toBe(true);
  });
  it('com uma Snake, não dispara; qualquer criatura Snake conta, não só as fichas dele', () => {
    const tg = setup({ step: 'end', battlefield: [['Ophiomancer', { name: 'Snake verde', token: true }], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
