import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lt. Arex, Ever-Adapting';
const terrenos = ['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Island', 'Island'];

describe(N, () => {
  it('compra três, põe terrenos da mão no campo virados, e a força e a resistência contam os nomes diferentes', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [['Plains', 'Swamp', 'Sol Ring'], []] });
    tg.choose('Lt. Arex', ['Plains', 'Swamp']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    // Forest, Island, Plains, Swamp
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});
