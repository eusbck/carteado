import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Undead Warchief', () => {
  it('as criaturas Zombie que você controla (inclusive ele) recebem +2/+1; as dos oponentes não', () => {
    const tg = setup({ battlefield: [['Undead Warchief', { name: 'Zombie 2/2', token: true }, 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }]] });
    expect(tg.pt(tg.bf('Undead Warchief'))).toEqual([3, 2]);
    expect(tg.pt(tg.find('Zombie 2/2', 'battlefield', 0)!)).toEqual([4, 3]);
    expect(tg.pt(tg.find('Zombie 2/2', 'battlefield', 1)!)).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('mágica de Zombie custa {1} a menos', () => {
    const tg = setup({ battlefield: [['Undead Warchief', 'Swamp', 'Swamp'], []], hand: [['Midnight Reaper'], []] });
    tg.cast('Midnight Reaper').resolve();
    expect(tg.find('Midnight Reaper')).not.toBeNull();
  });
  it('mágica que não é Zombie não fica mais barata', () => {
    const tg = setup({ battlefield: [['Undead Warchief', 'Swamp', 'Swamp'], []], hand: [['Withering Torment'], []] });
    expect(tg.canCast('Withering Torment')).toBe(false);
  });
  it('CR 118.7a: não reduz mana colorida', () => {
    const tg = setup({ battlefield: [['Undead Warchief', 'Swamp'], []], hand: [['Undead Augur'], []] });
    expect(tg.canCast('Undead Augur')).toBe(false);
  });
});
