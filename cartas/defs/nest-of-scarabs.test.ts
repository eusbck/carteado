import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addCounters, dealDamage } from '../../motor/api.ts';

describe('Nest of Scarabs', () => {
  it('conta todos os marcadores, mesmo além da resistência', () => {
    const tg = setup({ battlefield: [['Nest of Scarabs'], ['Elvish Mystic']] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Elvish Mystic') }, '-1/-1', 3, 0);
    tg.refresh().resolveAll();
    expect(tg.all('Insect').length).toBe(3);
  });
  it('dano de murchar conta', () => {
    const tg = setup({ battlefield: [['Nest of Scarabs', 'Midnight Banshee'], ['Wall of Omens']] });
    dealDamage(tg.g, [{ source: tg.bf('Midnight Banshee'), target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 2, combat: false }]);
    tg.refresh().resolveAll();
    expect(tg.all('Insect').length).toBe(2);
  });
});
