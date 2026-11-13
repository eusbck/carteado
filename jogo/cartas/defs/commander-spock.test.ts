import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Commander Spock';
const terrenos = ['Forest', 'Plains', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('ao entrar, conjura de graça a carta do topo com valor de mana até os terrenos de nomes diferentes', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [['Wall of Omens', 'Island', 'Island'], []] });
    tg.yes('Commander Spock: conjurar', true);
    tg.cast(N).resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
    // Wall of Omens comprou uma; Spock não compra (a carta saiu do topo)
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
  it('com valor de mana maior, não conjura e compra a carta', () => {
    // três nomes diferentes; Elder Gargaroth tem valor de mana 5
    const tg = setup({ battlefield: [[N], []], library: [['Elder Gargaroth', 'Island'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Elder Gargaroth']);
  });
  it('terreno no topo: pode pôr no campo virado (e aí não compra)', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Island'], []] });
    tg.yes('Commander Spock: pôr', true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
