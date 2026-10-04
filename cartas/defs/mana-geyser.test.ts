import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Mana Geyser', () => {
  it('adiciona {R} para cada terreno virado dos oponentes', () => {
    const virado = (name: string) => ({ name, tapped: true });
    const tg = setup({
      players: 3,
      battlefield: [Array(5).fill('Mountain'), [virado('Island'), virado('Island'), 'Island', virado('Sol Ring')], [virado('Forest')]],
      hand: [['Mana Geyser'], [], []],
    });
    tg.cast('Mana Geyser').resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R', 'R', 'R']);
  });
});
