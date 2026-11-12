import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Cancel', () => {
  it('anula a mágica alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island', 'Island', 'Island']], hand: [['Wall of Omens'], ['Cancel']] });
    tg.cast('Wall of Omens').pass();
    tg.choose('mágica alvo', ['Wall of Omens']).cast('Cancel').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});
