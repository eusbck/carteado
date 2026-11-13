import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Koth, the Geomancer';

describe(N, () => {
  it('cada terreno: 1 de dano a cada oponente; Montanha também dá {R}', () => {
    const tg = setup({ battlefield: [[N, 'Exploration'], []], hand: [['Mountain', 'Forest'], []] });
    tg.play('Mountain').resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
    tg.play('Forest').resolve();
    expect(tg.life(1)).toBe(38);
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
  });
});
