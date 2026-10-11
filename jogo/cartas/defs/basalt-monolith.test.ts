import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Basalt Monolith';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('{T}: {C}{C}{C}; {3}: desvira; não desvira na sua etapa de desvirar', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    activateMana(tg, N, 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C', 'C', 'C']);
    tg.activate(N, '{3}: Desvire').resolveAll();
    expect(tg.state.objects[id].tapped).toBe(false);
    activateMana(tg, N, 'C');
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.state.objects[id].tapped).toBe(true);
  });
});
