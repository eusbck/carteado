import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Thraben Watcher';

describe(N, () => {
  it('as outras criaturas suas que não são fichas recebem +1/+1 e vigilância', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade', { name: 'Spirit 1/1', token: true }], ['Baleful Strix']] });
    const w = tg.bf(N);
    expect(tg.pt(w)).toEqual([2, 2]);
    expect(hasKw(tg.g, w, 'flying')).toBe(true);
    const blade = tg.bf('Slither Blade');
    expect(tg.pt(blade)).toEqual([2, 3]);
    expect(hasKw(tg.g, blade, 'vigilance')).toBe(true);
    expect(tg.pt(tg.bf('Spirit'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Baleful Strix'))).toEqual([1, 1]);
  });
});
