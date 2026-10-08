import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Negate', () => {
  it('anula mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Negate']] });
    tg.cast("Night's Whisper").pass();
    tg.choose('não criatura', ["Night's Whisper"]).cast('Negate').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(["Night's Whisper"]);
  });
  it('não pode mirar mágica de criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island', 'Island']], hand: [['Wall of Omens'], ['Negate']] });
    tg.cast('Wall of Omens').pass();
    expect(tg.canCast('Negate')).toBe(false);
  });
});
