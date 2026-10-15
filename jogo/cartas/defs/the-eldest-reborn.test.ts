import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'The Eldest Reborn';
const pantanos = ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'];

describe(NOME, () => {
  it('I: cada oponente sacrifica uma criatura ou planeswalker à escolha dele', () => {
    const tg = setup({ players: 3, battlefield: [pantanos, ['Wall of Omens', 'Indomitable Ancients'], ['Sol Ring']], hand: [[NOME], [], []] });
    tg.choose('Sacrifique uma criatura ou planeswalker', ['Indomitable Ancients']);
    tg.cast(NOME);
    while (tg.state.zones.stack.length) tg.resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('II: cada oponente descarta uma carta à escolha dele, todas ao mesmo tempo', () => {
    const tg = setup({ step: 'draw', battlefield: [[{ name: NOME, counters: { lore: 1 } }], []], hand: [[], ['Island', 'Forest']], library: [['Island'], []] });
    tg.choose('Descarte uma carta', ['Forest']);
    tg.passTo('main1');
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
  });

  it('III: põe a criatura do cemitério de um oponente no campo sob o seu controle e a Saga é sacrificada', () => {
    const tg = setup({ step: 'draw', battlefield: [[{ name: NOME, counters: { lore: 2 } }], []], graveyard: [['Wall of Omens'], ['Indomitable Ancients']], library: [['Island'], []] });
    tg.choose('carta de criatura ou planeswalker alvo', ['Indomitable Ancients']);
    tg.passTo('main1');
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.find(NOME)).toBeNull();
  });
});
