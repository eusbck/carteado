import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shattered Angel';

describe(N, () => {
  it('voar; quando um terreno de um oponente entra, você pode ganhar 3 de vida', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.yes('Shattered Angel', true);
    enterCard(tg, 'Forest', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(43);
    // o seu terreno não conta
    enterCard(tg, 'Forest', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(43);
  });
});