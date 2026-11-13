import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tannuk, Memorial Ensign';

describe(N, () => {
  it('cada terreno causa 1 de dano a cada oponente; só a segunda resolução no turno compra uma carta', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Exploration'], [], []], hand: [['Forest', 'Mountain'], [], []], library: [['Island', 'Plains', 'Swamp'], [], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(2)).toBe(39);
    expect(tg.names(0, 'hand')).toEqual(['Mountain']);
    tg.play('Mountain').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
