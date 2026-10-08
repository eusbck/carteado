import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Priest of Forgotten Gods', () => {
  it('jogadores alvo perdem 2 e sacrificam; você adiciona {B}{B} e compra; jogador sem criatura ainda perde 2', () => {
    const tg = setup({ players: 3, battlefield: [['Priest of Forgotten Gods', 'Wall of Omens', 'Elvish Mystic'], ['Indomitable Ancients'], []], library: [['Island'], [], []] });
    tg.choose('jogadores alvo', ['Bruno', 'Carla']).choose('Sacrifique', ['Wall of Omens', 'Elvish Mystic']);
    tg.activate('Priest of Forgotten Gods').resolve();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B']);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('sem alvos, ainda adiciona {B}{B} e compra', () => {
    const tg = setup({ battlefield: [['Priest of Forgotten Gods', 'Wall of Omens', 'Elvish Mystic'], ['Indomitable Ancients']], library: [['Island'], []] });
    tg.choose('jogadores alvo', []);
    tg.activate('Priest of Forgotten Gods').resolve();
    expect(tg.life(1)).toBe(40);
    expect(tg.state.players[0].manaPool.length).toBe(2);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
