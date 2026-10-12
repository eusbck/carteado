import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mana Drain';

describe(N, () => {
  it('anula a mágica e, no início da sua próxima fase principal, adiciona {C} igual ao valor de mana dela', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], Array(5).fill('Plains')], hand: [[N], ['Serra Angel']], library: [Array(3).fill('Island'), Array(3).fill('Island')] });
    tg.cast('Serra Angel').pass();
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Serra Angel') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Serra Angel']);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
    tg.passTo('main1', 0);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['C', 'C', 'C', 'C', 'C']);
  });
});