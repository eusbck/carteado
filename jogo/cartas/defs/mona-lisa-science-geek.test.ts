import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mona Lisa, Science Geek';

describe(N, () => {
  it('alcance; {T}: X manas de uma cor, X = a força dela', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'reach')).toBe(true);
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['G', 'G', 'G']);
  });
});