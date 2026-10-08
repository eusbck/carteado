import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { counter } from '../../motor/api.ts';

describe("Bontu's Monument", () => {
  it('mágica de criatura preta custa {1} a menos e dispara: cada oponente perde 1, você ganha 1', () => {
    const tg = setup({ players: 3, battlefield: [["Bontu's Monument", 'Swamp', 'Swamp'], [], []], hand: [['Midnight Reaper'], [], []] });
    tg.cast('Midnight Reaper').resolveAll();
    expect(tg.find('Midnight Reaper')).not.toBeNull();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([41, 39, 39]);
  });
  it('mágica de criatura preta multicolorida fica mais barata', () => {
    const tg = setup({ battlefield: [["Bontu's Monument", 'Swamp', 'Forest'], []], hand: [['Dina, Essence Brewer'], []] });
    tg.cast('Dina, Essence Brewer').resolveAll();
    expect(tg.find('Dina, Essence Brewer')).not.toBeNull();
  });
  it('mágica de criatura não preta dispara, mas não fica mais barata', () => {
    const tg = setup({ battlefield: [["Bontu's Monument", 'Forest'], []], hand: [['Elvish Mystic', 'Wall of Omens'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
  it('mágica que não é de criatura não dispara nem fica mais barata', () => {
    const tg = setup({ battlefield: [["Bontu's Monument", 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Withering Torment'], []] });
    expect(tg.canCast('Withering Torment')).toBe(false);
    expect([tg.life(0), tg.life(1)]).toEqual([40, 40]);
  });
  it('o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada', () => {
    const tg = setup({ battlefield: [["Bontu's Monument", 'Swamp', 'Swamp'], []], hand: [['Midnight Reaper'], []] });
    tg.cast('Midnight Reaper');
    const magia = tg.find('Midnight Reaper', 'stack')!;
    tg.resolve();
    expect(tg.state.zones.stack).toEqual([magia]);
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    tg.run(counter(tg.g, magia));
    expect(tg.names(0, 'graveyard')).toEqual(['Midnight Reaper']);
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
  });
});
