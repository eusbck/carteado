import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield, returnToHand } from '../../motor/api.ts';

describe('Consuming Corruption', () => {
  it('X de dano à criatura alvo e você ganha X de vida, X = Swamps que você controla', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Island'], ['Indomitable Ancients', 'Swamp']], hand: [['Consuming Corruption'], []] });
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast('Consuming Corruption').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.life(0)).toBe(43);
  });
  it('X = Swamps que você controla na resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Consuming Corruption'], []], library: [['Swamp', 'Swamp'], []] });
    tg.cast('Consuming Corruption');
    const lib = [...tg.state.zones.library[0]];
    tg.run(putOntoBattlefield(tg.g, lib.map((id) => ({ id, controller: 0 })), 'effect'));
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.life(0)).toBe(44);
  });
  it('pode mirar planeswalker: tira lealdade', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Quintorius, History Chaser']], hand: [['Consuming Corruption'], []] });
    tg.cast('Consuming Corruption').resolve();
    expect(tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty).toBe(3);
    expect(tg.life(0)).toBe(42);
  });
  it('CR 608.2b: alvo ilegal na resolução, não resolve e você não ganha vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Consuming Corruption'], []] });
    tg.cast('Consuming Corruption');
    tg.run(returnToHand(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolve();
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'graveyard')).toEqual(['Consuming Corruption']);
  });
});
