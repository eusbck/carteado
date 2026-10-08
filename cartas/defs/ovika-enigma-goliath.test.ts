import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const OVIKA = 'Ovika, Enigma Goliath';
const goblins = (tg: ReturnType<typeof setup>) => tg.all('Phyrexian Goblin');

describe('Ovika, Enigma Goliath', () => {
  it('mágica que não é de criatura: X Goblins Phyrexianos 1/1 com ímpeto até o fim do turno', () => {
    const tg = setup({ battlefield: [[OVIKA, 'Island'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolve();
    expect(goblins(tg)).toHaveLength(1);
    expect(tg.pt(goblins(tg)[0])).toEqual([1, 1]);
    expect(hasKw(tg.g, goblins(tg)[0], 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, goblins(tg)[0], 'haste')).toBe(false);
  });

  it('valor de mana 2: dois Goblins', () => {
    const tg = setup({ battlefield: [[OVIKA, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Night\'s Whisper', 'Indomitable Ancients'], []], library: [['Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolveAll();
    expect(goblins(tg)).toHaveLength(2);
  });

  it('mágica de criatura não dispara', () => {
    const tg = setup({ battlefield: [[OVIKA, 'Plains', 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolveAll();
    expect(goblins(tg)).toHaveLength(0);
  });

  it('com {X}, o valor escolhido conta no valor de mana da mágica', () => {
    const tg = setup({ battlefield: [[OVIKA, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [["Black Sun's Zenith"], []] });
    tg.number('valor de X', 3).cast("Black Sun's Zenith");
    tg.resolve(); // o gatilho resolve antes da mágica: {X}{B}{B} com X = 3 → valor de mana 5
    expect(goblins(tg)).toHaveLength(5);
  });

  it('resguardo — {3} e pagar 3 de vida: pagando, a mágica do oponente resolve', () => {
    const tg = setup({ active: 1, battlefield: [[OVIKA], ['Plains', 'Plains', 'Plains', 'Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Resguardo', true).choose('criatura alvo', [OVIKA]).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.find(OVIKA, 'exile')).not.toBeNull();
  });

  it('resguardo: sem a mana, a vida não é paga e a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [[OVIKA], ['Plains', 'Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Resguardo', true).choose('criatura alvo', [OVIKA]).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(1)).toBe(40);
    expect(tg.find(OVIKA)).not.toBeNull();
  });
});
