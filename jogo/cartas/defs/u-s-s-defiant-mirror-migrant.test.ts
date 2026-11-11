import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'U.S.S. Defiant, Mirror Migrant';

describe(N, () => {
  it('ao entrar, ela e uma criatura sua saem de fase até o seu próximo turno', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Elvish Mystic'], []], hand: [[N], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.choose('até uma criatura alvo', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].phasedOut).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].phasedOut).toBe(true);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    expect(tg.state.objects[tg.bf(N)].phasedOut).toBeFalsy();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].phasedOut).toBeFalsy();
  });
  it('com 8+ marcadores de carga, é criatura 5/5', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 8 } }], []] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });
});
