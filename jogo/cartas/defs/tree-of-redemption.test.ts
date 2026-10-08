import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tree of Redemption', () => {
  it('você ganha a diferença; modificadores de resistência se aplicam depois da troca', () => {
    const tg = setup({ battlefield: [[{ name: 'Tree of Redemption', ready: true }, { name: 'Spirit Mantle', attachTo: 'Tree of Redemption' }], []] });
    tg.state.players[0].life = 7;
    tg.refresh().activate('Tree of Redemption').resolve();
    expect(tg.life(0)).toBe(14); // 13 + 1 da Aura
    expect(tg.pt(tg.bf('Tree of Redemption'))).toEqual([1, 8]);
  });
});
