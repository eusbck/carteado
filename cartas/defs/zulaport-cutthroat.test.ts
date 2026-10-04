import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Zulaport Cutthroat', () => {
  it('CR 603.10a: morrendo junto com outra, dispara para as duas', () => {
    const tg = setup({ players: 3, battlefield: [['Zulaport Cutthroat', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens'], []], hand: [['Toxic Deluge'], [], []] });
    tg.number('valor de X', 1).cast('Toxic Deluge').resolve().resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([39 + 2, 38, 38]);
  });
});
