import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addCounters } from '../../motor/api.ts';

describe('Lasting Tarfire', () => {
  it('com marcador numa criatura no turno, causa 2 a cada oponente na etapa final (de qualquer jogador)', () => {
    const tg = setup({ step: 'main2', active: 1, battlefield: [['Lasting Tarfire', 'Wall of Omens'], []], library: [['Island'], ['Island']] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Wall of Omens') }, '+1/+1', 1, 0);
    tg.refresh().passTo('end').resolve();
    expect(tg.life(1)).toBe(38);
  });
  it('sem marcador no turno, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [['Lasting Tarfire', 'Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.passTo('cleanup');
    expect(tg.life(1)).toBe(40);
  });
});
