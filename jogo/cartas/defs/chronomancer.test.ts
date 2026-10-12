import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Chronomancer';

describe(N, () => {
  it('voar; {1}, {T}, sacrifique outro artefato: compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Arcade Cabinet'], []], library: [['Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.choose('Sacrifique', ['Arcade Cabinet']).activate(N).resolveAll();
    expect(tg.find('Arcade Cabinet')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('desenterrar {2}{B}', () => {
    const tg = setup({ battlefield: [Array(3).fill('Swamp'), []], graveyard: [[N], []] });
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
  });
});