import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Hulking Raptor';

describe(N, () => {
  it('na sua primeira fase principal, adiciona {G}{G}; tem resguardo', () => {
    const tg = setup({ step: 'draw', battlefield: [[N], []], library: [['Forest'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'ward')).toBe(true);
    tg.passUntil((x) => x.state.turn.step === 'main1' && x.state.zones.stack.length === 1).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['G', 'G']);
  });
});
