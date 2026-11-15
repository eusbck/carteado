import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Stock Up';
describe(N, () => {
  it('olha cinco, põe duas na mão e permite ordenar as outras três no fundo', () => {
    const tg = setup({ battlefield: [Array(3).fill('Island'), []], hand: [[N], []], library: [['Plains', 'Swamp', 'Mountain', 'Forest', 'Sol Ring', 'Counterspell'], []] });
    tg.choose('para a sua mão', ['Sol Ring', 'Plains']).choose('ordem das cartas no fundo', ['Forest', 'Swamp', 'Mountain']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Counterspell', 'Forest', 'Swamp', 'Mountain']);
    // CR 121.5: colocar na mão não é comprar.
    expect(tg.state.turnStats[0].cardsDrawn).toBe(0);
  });
  it('CR 609.3: com menos de duas cartas, coloca todas na mão; vazio não causa derrota', () => {
    for (const lib of [[], ['Forest']]) {
      const tg = setup({ battlefield: [Array(3).fill('Island'), []], hand: [[N], []], library: [lib, []] });
      tg.cast(N).resolve();
      expect(tg.names(0, 'hand')).toEqual(lib);
      expect(tg.names(0, 'library')).toEqual([]);
      expect(tg.state.players[0].lost).toBeFalsy();
    }
  });
});
