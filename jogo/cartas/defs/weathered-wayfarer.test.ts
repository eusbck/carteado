import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Weathered Wayfarer';

describe(N, () => {
  it('{W}, {T}: busca um terreno para a mão, só se um oponente controla mais terrenos que você', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], ['Island', 'Island']], library: [['Sol Ring', 'Swamp', 'Sol Ring'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.choose('Weathered Wayfarer', ['Swamp']);
    tg.activate(N, '{W}, {T}').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    const igual = setup({ battlefield: [[N, 'Plains'], ['Island']], library: [['Swamp'], []] });
    expect(() => igual.activate(N, '{W}, {T}')).toThrow();
  });
});
