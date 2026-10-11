import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Guttersnipe';

describe(N, () => {
  it('causa 2 de dano a cada oponente antes de a mágica resolver', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Island', 'Island'], [], []], hand: [['Preordain', 'Sol Ring'], [], []], library: [Array(6).fill('Island'), [], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.cast('Preordain');
    tg.resolve();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    // artefato não dispara
    tg.cast('Sol Ring').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
  });
});
