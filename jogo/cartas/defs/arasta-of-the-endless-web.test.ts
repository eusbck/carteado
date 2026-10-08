import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Arasta of the Endless Web', () => {
  it('CR 603.3: o gatilho resolve antes da mágica, mesmo que ela seja anulada', () => {
    const tg = setup({ active: 1, battlefield: [['Arasta of the Endless Web', 'Island', 'Island'], ['Swamp', 'Swamp']], hand: [['Counterspell'], ["Night's Whisper"]] });
    tg.cast("Night's Whisper");
    expect(tg.state.zones.stack.length).toBe(2); // mágica + gatilho por cima
    tg.resolve();
    expect(tg.pt(tg.bf('Spider'))).toEqual([1, 2]);
    tg.pass(); // Bruno passa; Ana responde
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(["Night's Whisper"]);
    expect(tg.all('Spider').length).toBe(1);
  });
  it('mágicas de criatura e as suas não disparam', () => {
    const tg = setup({ battlefield: [['Arasta of the Endless Web', 'Swamp', 'Swamp'], ['Plains', 'Plains']], hand: [["Night's Whisper"], ['Wall of Omens']] });
    tg.cast("Night's Whisper");
    expect(tg.state.zones.stack.length).toBe(1);
  });
});
