import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tree of Perdition', () => {
  it('o jogador perde a diferença; modificadores de resistência se aplicam depois da troca', () => {
    const tg = setup({ battlefield: [[{ name: 'Tree of Perdition', ready: true, counters: { '+1/+1': 1 } }], []] });
    tg.state.players[1].life = 7;
    tg.refresh().activate('Tree of Perdition').resolve();
    expect(tg.life(1)).toBe(14); // a resistência era 14 (13 + 1)
    expect(tg.pt(tg.bf('Tree of Perdition'))).toEqual([1, 8]); // vira 7, mais o marcador
  });
});
