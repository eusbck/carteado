import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/actions.ts';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Kami of Whispered Hopes';

describe(N, () => {
  it('com duas Kami, dois marcadores a mais, em qualquer permanente seu', () => {
    const tg = setup({ battlefield: [[N, N, 'Sol Ring'], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Sol Ring') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Sol Ring')].counters['+1/+1']).toBe(3);
  });
  it('X manas de uma cor só, onde X é a força', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], []] });
    const id = tg.bf(N);
    const alts = manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''));
    const x = tg.pt(id)[0];
    expect(x).toBeGreaterThan(0);
    expect(alts).toContain('G'.repeat(x));
    expect(alts).toContain('R'.repeat(x));
    expect(alts.length).toBe(5);
  });
});
