import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Black Market', () => {
  it('na primeira fase principal, adiciona {B} para cada marcador de carga', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Black Market', 'Wall of Omens'], ['Wall of Omens']], library: [['Island', 'Island', 'Island'], ['Island', 'Island']] });
    tg.run(destroy(tg.g, tg.all('Wall of Omens')));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Black Market')].counters.charge).toBe(2);
    tg.passTo('main1');
    tg.resolveAll();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B']);
  });
});
