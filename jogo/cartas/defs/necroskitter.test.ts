import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf, destroy } from '../../motor/api.ts';

describe('Necroskitter', () => {
  it('volta sem os marcadores, sob seu controle', () => {
    const tg = setup({ battlefield: [['Necroskitter'], [{ name: 'Wall of Omens', counters: { '-1/-1': 1 } }]], library: [['Island'], ['Island']] });
    tg.yes('Necroskitter');
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    const w = tg.bf('Wall of Omens');
    expect(controllerOf(tg.g, w)).toBe(0);
    expect(tg.state.objects[w].counters['-1/-1'] ?? 0).toBe(0);
  });
  it('sem marcador -1/-1, não dispara', () => {
    const tg = setup({ battlefield: [['Necroskitter'], ['Wall of Omens']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
  });
});
