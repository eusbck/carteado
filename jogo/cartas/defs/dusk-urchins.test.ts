import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dusk Urchins', () => {
  it('o marcador entra na declaração, antes do dano; ao morrer compra por marcador', () => {
    const tg = setup({ battlefield: [[{ name: 'Dusk Urchins', counters: { '-1/-1': 1 } }], ['Wall of Omens']], library: [['Island', 'Island', 'Island'], []] });
    tg.attack([['Dusk Urchins', 1]]).block([['Wall of Omens', 'Dusk Urchins']]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Dusk Urchins'))).toEqual([2, 1]);
    tg.passTo('combatDamage');
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(2);
  });
  it('morrendo com marcadores, compra uma por marcador', () => {
    const tg = setup({ battlefield: [[{ name: 'Dusk Urchins', counters: { '-1/-1': 2 } }, 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.choose('criatura alvo', ['Dusk Urchins']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
