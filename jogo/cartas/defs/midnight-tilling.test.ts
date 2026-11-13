import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Midnight Tilling', () => {
  it('moi quatro e devolve uma carta de permanente dentre elas', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [['Midnight Tilling'], []], library: [["Night's Whisper", 'Sol Ring', 'Forest', 'Island', 'Plains'], []] });
    tg.choose('devolver uma carta de permanente', ['Sol Ring']).cast('Midnight Tilling').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', 'Midnight Tilling', "Night's Whisper"].sort());
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
  it('não oferece instantâneas nem feitiços', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [['Midnight Tilling'], []], library: [["Night's Whisper", "Night's Whisper"], []] });
    tg.cast('Midnight Tilling').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
