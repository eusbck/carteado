import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lieutenant Nyota Uhura';

describe(N, () => {
  it('o oponente exila X cartas (terrenos com nomes diferentes); você conjura uma instantânea de graça e o resto vai para o fundo', () => {
    // Forest, Island, Plains: X = 3 (mais Sol Ring para pagar o {4})
    const tg = setup({
      battlefield: [[N, 'Forest', 'Island', 'Plains', 'Sol Ring'], []],
      library: [['Mountain'], ['Wall of Omens', 'Growth Spiral', 'Forest', 'Island', 'Swamp']],
    });
    tg.choose('Lieutenant Uhura', ['Growth Spiral']).yes('sem pagar', true);
    tg.activate(N).resolveAll();
    // a Growth Spiral foi conjurada por Ana: ela compra uma carta (a Mountain)
    expect(tg.names(1, 'graveyard')).toEqual(['Growth Spiral']);
    expect(tg.names(1, 'library').slice(0, 2)).toEqual(['Island', 'Swamp']);
    expect(tg.names(1, 'library').slice(2).sort()).toEqual(['Forest', 'Wall of Omens']);
    expect(tg.state.zones.exile.length).toBe(0);
  });
});
