import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mesmeric Orb';

describe(N, () => {
  it('na etapa de desvirar, um gatilho por permanente desvirado, resolvidos na manutenção', () => {
    const tg = setup({
      active: 1, step: 'main2',
      battlefield: [[N, { name: 'Forest', tapped: true }, { name: 'Island', tapped: true }, 'Swamp'], [{ name: 'Plains', tapped: true }]],
      library: [['Hex', 'Hex', 'Hex', 'Hex'], ['Hex', 'Hex']],
    });
    tg.passTo('main1', 0);
    expect(tg.state.turn.active).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex', 'Hex']);
    // o Plains de Bruno não desvira no turno de Ana
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });
});
