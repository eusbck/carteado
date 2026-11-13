import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Grim Monolith';

describe(N, () => {
  it('{T}: {C}{C}{C}; {4}: desvira; não desvira na sua etapa de desvirar', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Thran Dynamo'], []], library: [['Opt'], ['Forest']] });
    tg.cast('Thran Dynamo').resolve();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const tg1 = setup({ battlefield: [[{ name: N, tapped: true }, 'Island', 'Island', 'Island', 'Island'], []] });
    tg1.activate(N, '{4}').resolve();
    expect(tg1.state.objects[tg1.bf(N)].tapped).toBe(false);
    const tg2 = setup({ active: 1, battlefield: [[{ name: N, tapped: true }], []], library: [['Opt'], ['Forest']] });
    tg2.passTo('main1', 0);
    expect(tg2.state.objects[tg2.bf(N)].tapped).toBe(true);
  });
});
