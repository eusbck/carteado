import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Flayed One';

describe(N, () => {
  it('vínculo com a vida; ao entrar tritura três cartas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [Array(4).fill('Island'), ['Island']] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 1]);
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    expect(tg.names(0, 'graveyard')).toHaveLength(3);
  });
});