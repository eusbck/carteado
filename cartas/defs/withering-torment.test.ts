import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { returnToHand } from '../../motor/api.ts';

describe('Withering Torment', () => {
  it('destrói a criatura alvo e você perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Withering Torment'], []] });
    tg.choose('criatura ou encantamento alvo', ['Wall of Omens']).cast('Withering Torment').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.life(0)).toBe(38);
  });
  it('destrói o encantamento alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Graf Harvest', 'Island']], hand: [['Withering Torment'], []] });
    tg.choose('criatura ou encantamento alvo', ['Graf Harvest']).cast('Withering Torment').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Graf Harvest']);
  });
  it('não pode mirar terreno nem artefato não criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Island', 'Sol Ring']], hand: [['Withering Torment'], []] });
    expect(tg.canCast('Withering Torment')).toBe(false);
  });
  it('CR 608.2b: alvo ilegal na resolução, não resolve e você não perde vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Withering Torment'], []] });
    tg.cast('Withering Torment');
    tg.run(returnToHand(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolve();
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'graveyard')).toEqual(['Withering Torment']);
  });
});
