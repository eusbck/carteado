import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Dungrove Elder';

describe(N, () => {
  it('conta os terrenos com o tipo Forest, não só os chamados Forest, e muda com eles', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Canopy Vista', 'Plains'], ['Forest']], hand: [['Forest'], []] });
    const d = tg.bf(N);
    expect(hasKw(tg.g, d, 'hexproof')).toBe(true);
    expect(tg.pt(d)).toEqual([3, 3]);
    tg.play('Forest');
    expect(tg.pt(d)).toEqual([4, 4]);
  });

  it('vale também fora do campo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []] });
    expect(tg.pt(tg.find(N, 'hand')!)).toEqual([2, 2]);
  });
});
