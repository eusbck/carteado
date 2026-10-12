import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Acidic Slime';

describe(N, () => {
  it('toque mortífero; quando entra, destrói um artefato, encantamento ou terreno', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), ['Island', 'Silver Myr']], hand: [[N], []] });
    tg.choose('artefato, encantamento ou terreno alvo', ['Island']).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    expect(tg.find('Island')).toBeNull();
  });
});