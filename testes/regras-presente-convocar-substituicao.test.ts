// Regras novas do motor para os decks importados do Moxfield: substituição de "sair do campo" (CR 614.6, 616.1),
// convoke (CR 702.51), presente (CR 702.174) e resguardo pago com vida (CR 702.21a, 119.4).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

const KALITAS = 'Kalitas, Traitor of Ghet';

describe('substituição ao sair do campo (leavesBattlefield)', () => {
  it('CR 616.1: duas substituições — quem controla a criatura escolhe qual aplicar; a outra não se aplica mais', () => {
    const tg = setup({ players: 3, battlefield: [['Indomitable Ancients', 'Swamp', 'Swamp'], [KALITAS], [KALITAS]], hand: [['Infernal Grasp'], [], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('substituição')) return null;
      opcoes = d.items.map((i) => i.label);
      expect(d.player).toBe(0);
      return { kind: 'select', ids: [d.items[1].id] };
    });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(opcoes).toHaveLength(2);
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    const zumbis = tg.all('Zombie 2/2').map((id) => tg.state.objects[id].controller);
    expect(zumbis).toHaveLength(1);
  });

  it('não vale para o que sai do campo por outro caminho (exílio, mão)', () => {
    const tg = setup({ battlefield: [[KALITAS], ['Indomitable Ancients', 'Plains']], active: 1, hand: [[], ['Swords to Plowshares']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares').resolve();
    expect(tg.all('Zombie 2/2')).toEqual([]);
  });
});

describe('convoke', () => {
  it('CR 702.51a: não muda o valor de mana da mágica (Ovika vê 8)', () => {
    const SUP = "Stitcher's Supplier";
    const tg = setup({ battlefield: [['Ovika, Enigma Goliath', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', SUP, SUP], []], hand: [['Bloodline Bidding'], []] });
    tg.choose('Convocar', [SUP, SUP]).cast('Bloodline Bidding');
    tg.resolve();
    expect(tg.all('Phyrexian Goblin')).toHaveLength(8);
  });

  it('a criatura usada no convoke fica virada e o resto sai dos terrenos', () => {
    const SUP = "Stitcher's Supplier";
    const tg = setup({ battlefield: [[...Array.from({ length: 7 }, () => 'Swamp'), SUP], []], hand: [['Bloodline Bidding'], []] });
    tg.choose('Convocar', [SUP]).choose('tipo de criatura', ['Zombie']).cast('Bloodline Bidding');
    expect(tg.state.objects[tg.bf(SUP)].tapped).toBe(true);
    // pagou 7 com terrenos e 1 com a criatura
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Swamp' && tg.state.objects[id].tapped)).toHaveLength(7);
  });
});
