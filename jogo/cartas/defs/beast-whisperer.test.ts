import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Beast Whisperer';

describe(N, () => {
  it('conjurar uma mágica de criatura compra uma carta antes de ela resolver; outra mágica, não', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], []], hand: [['Llanowar Elves', 'Sol Ring'], []] });
    tg.cast('Llanowar Elves').resolve();
    expect(tg.state.zones.hand[0]).toHaveLength(2);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
