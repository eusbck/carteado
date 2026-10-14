import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Secret Rendezvous';

describe(N, () => {
  it('você e o oponente alvo compram três cartas cada', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains'], [], []], hand: [[N], [], []] });
    tg.choose('oponente alvo', ['Carla']).cast(N).resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(3);
    expect(tg.state.zones.hand[2]).toHaveLength(3);
    expect(tg.state.zones.hand[1]).toHaveLength(0);
  });
});
