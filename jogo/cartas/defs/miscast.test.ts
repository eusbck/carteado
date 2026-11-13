import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ND = "Night's Whisper";

describe('Miscast', () => {
  it('anula a instantânea ou feitiço se o controlador não paga {3}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island']], hand: [[ND], ['Miscast']] });
    tg.cast(ND).pass();
    tg.yes('Pagar {3}', false);
    tg.choose('instantânea ou de feitiço', [ND]).cast('Miscast').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([ND]);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 118.12a: quem paga {3} mantém a mágica', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Island']], hand: [[ND], ['Miscast']] });
    tg.cast(ND).pass();
    tg.yes('Pagar {3}', true);
    tg.choose('instantânea ou de feitiço', [ND]).cast('Miscast').resolve();
    expect(tg.find(ND, 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.life(0)).toBe(38);
  });
  it('não mira mágica de criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island']], hand: [['Wall of Omens'], ['Miscast']] });
    tg.cast('Wall of Omens').pass();
    expect(tg.canCast('Miscast')).toBe(false);
  });
});
