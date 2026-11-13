// lote4-e: dragar (dredge, CR 702.52; motor/dragar.ts), com a Life from the Loam (dragar 3)
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { dredgeN, dredgeOptions } from '../motor/api.ts';

const N = 'Life from the Loam';

describe('Dragar (CR 702.52)', () => {
  it('CR 702.52a: só funciona com a carta no cemitério; na mão a compra é normal', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper", N], []], library: [['Hex', 'Hex', 'Hex', 'Island'], []] });
    expect(dredgeN(tg.g, tg.find(N, 'hand')!)).toBe(3);
    expect(dredgeOptions(tg.g, 0)).toEqual([]);
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Dragar')) perguntou = true; return null; });
    tg.cast("Night's Whisper").resolve();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'hand').sort()).toEqual([N, 'Hex', 'Hex'].sort());
  });

  it('CR 702.52a: no lugar da compra, moe N cartas e a carta volta do cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], graveyard: [[N], []], library: [['Hex', 'Hex', 'Hex', 'Island', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Dragar') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.cast("Night's Whisper").resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', N]);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Hex', 'Hex', 'Hex', "Night's Whisper"]);
    expect(tg.state.turnStats[0].cardsDrawn).toBe(1);
  });

  it('CR 702.52b: com menos de N cartas no grimório não é oferecido', () => {
    const tg = setup({ graveyard: [[N], []], library: [['Hex', 'Hex'], []] });
    expect(dredgeOptions(tg.g, 0)).toEqual([]);
  });

  it('CR 702.52a: só o dono (quem tem a carta no cemitério) pode dragar', () => {
    const tg = setup({ graveyard: [[], [N]], library: [['Hex', 'Hex', 'Hex'], ['Hex', 'Hex', 'Hex']] });
    expect(dredgeOptions(tg.g, 0)).toEqual([]);
    expect(dredgeOptions(tg.g, 1).length).toBe(1);
  });
});
