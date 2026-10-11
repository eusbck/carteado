import { describe, expect, it } from 'vitest';
import { activateMana } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Worn Powerstone';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('entra virado; {T}: {C}{C}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].tapped).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    activateMana(tg, N, 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C', 'C']);
  });
});
