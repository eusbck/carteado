// Megamorfose (CR 702.37b): "Megamorph is a variant of the morph ability. [...] 'As this permanent is turned face up,
// put a +1/+1 counter on it if its megamorph cost was paid to turn it face up.' A megamorph cost is a morph cost."
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { morphCost } from '../motor/api.ts';
import { setup } from './harness.ts';

describe('CR 702.37b: megamorfose', () => {
  it('um custo de megamorfose é um custo de morph: conjura virada por {3} e vira pagando {U}', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Gudul Lurker'], []] });
    expect(morphCost(tg.g, tg.find('Gudul Lurker', 'hand', 0)!)).toBe('{U}');
    tg.cast('Gudul Lurker', 'morph').resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    tg.answer({ kind: 'priority', action: `morph:${id}` });
    tg.settle();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
  });
  it('morph comum continua sem marcador', () => {
    const terrenos = Array(9).fill('Mountain');
    const tg = setup({ battlefield: [terrenos, []], hand: [['Akroma, Angel of Fury'], []] });
    tg.cast('Akroma, Angel of Fury', 'morph').resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    tg.answer({ kind: 'priority', action: `morph:${id}` });
    tg.settle();
    expect(tg.state.objects[id].faceDown).toBe(false);
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
  });
});
