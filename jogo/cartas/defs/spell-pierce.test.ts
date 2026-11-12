import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ND = "Night's Whisper";

describe('Spell Pierce', () => {
  it('anula a mágica não criatura se o controlador não paga {2}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Island']], hand: [[ND], ['Spell Pierce']] });
    tg.cast(ND).pass();
    tg.yes('Pagar {2}', false);
    tg.choose('não criatura', [ND]).cast('Spell Pierce').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([ND]);
  });
  it('não mira mágica de criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island']], hand: [['Wall of Omens'], ['Spell Pierce']] });
    tg.cast('Wall of Omens').pass();
    expect(tg.canCast('Spell Pierce')).toBe(false);
  });
});
