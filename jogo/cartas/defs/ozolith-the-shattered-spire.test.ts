import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ozolith, the Shattered Spire';

describe(N, () => {
  it('{1}{G}, {T}: o marcador no próprio Ozolith (artefato) vira dois', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []] });
    tg.choose('artefato ou criatura alvo', [N]).activate(N).resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
  });
  it('ciclagem {2}', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Island'], []] });
    tg.activate(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
