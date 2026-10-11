import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Armillary Sphere';

describe(N, () => {
  it('sacrificada, busca até duas cartas de terreno básico para a mão', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], library: [['Sol Ring', 'Plains', 'Swamp', 'Command Tower', 'Forest'], []] });
    tg.choose('terreno básico', ['Plains', 'Swamp']);
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(0, 'library')).toHaveLength(3);
  });
});