import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Managorger Hydra';

describe(N, () => {
  it('qualquer jogador que conjura uma mágica dá um marcador +1/+1, antes de a mágica resolver', () => {
    const tg = fixture({ battlefield: [[N, 'Forest'], ['Forest']], hand: [['Llanowar Elves'], ['Llanowar Elves']] });
    tg.cast('Llanowar Elves');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.resolve();
    tg.passTo('main1', 1);
    tg.cast('Llanowar Elves').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});
