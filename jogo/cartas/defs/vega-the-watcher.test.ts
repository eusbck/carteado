import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Vega, the Watcher';

describe(N, () => {
  it('conjurando do cemitério você compra uma carta antes de a mágica resolver; da mão, não', () => {
    // Lidless Gaze tem retrospectiva {2}{B}{R}
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Mountain', 'Mountain', 'Island'], []], hand: [['Sol Ring'], []], graveyard: [['Lidless Gaze'], []], library: [Array(6).fill('Island'), Array(6).fill('Island')] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.cast('Lidless Gaze', 'flashback');
    tg.resolve();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
