import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addCounters } from '../../motor/api.ts';

describe("Wickersmith's Tools", () => {
  it('X pelos marcadores de carga; as fichas entram viradas', () => {
    const tg = setup({ battlefield: [["Wickersmith's Tools", ...Array(5).fill('Plains')], ['Wall of Omens', 'Glissa Sunslayer']] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Wall of Omens') }, '-1/-1', 2, 0);
    tg.refresh().resolveAll();
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Glissa Sunslayer') }, '-1/-1', 1, 0);
    tg.refresh().resolveAll();
    expect(tg.state.objects[tg.bf("Wickersmith's Tools")].counters.charge).toBe(2);
    tg.activate("Wickersmith's Tools", 'Scarecrow').resolve();
    const f = tg.all('Scarecrow');
    expect(f.length).toBe(2);
    expect(f.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
