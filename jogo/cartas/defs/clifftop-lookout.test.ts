import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Clifftop Lookout';

describe(N, () => {
  it('revela até um terreno, que entra virado; as outras vão para o fundo', () => {
    const tg = fixture({ battlefield: [[], []], library: [['Sol Ring', 'Ripjaw Raptor', 'Canopy Vista', 'Island', 'Plains'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    const v = tg.bf('Canopy Vista');
    expect(tg.state.objects[v].tapped).toBe(true);
    const lib = tg.names(0, 'library');
    expect(lib.slice(0, 2)).toEqual(['Island', 'Plains']);
    expect(lib.slice(2).sort()).toEqual(['Ripjaw Raptor', 'Sol Ring']);
  });

  it('sem terreno no grimório, nada entra e as cartas continuam no grimório', () => {
    const tg = fixture({ battlefield: [[], []], library: [['Sol Ring', 'Ripjaw Raptor'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'library').sort()).toEqual(['Ripjaw Raptor', 'Sol Ring']);
  });
});
