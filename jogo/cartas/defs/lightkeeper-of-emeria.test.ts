import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Lightkeeper of Emeria';
const planicies = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('CR 702.33c: com o multikicker pago três vezes, ganha 6 de vida', () => {
    const tg = fixture({ battlefield: [planicies(7), []], hand: [[N], []] });
    tg.number('quantas vezes', 3).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.life(0)).toBe(46);
    expect(tg.all('Plains').every((p) => tg.state.objects[p].tapped)).toBe(true);
  });

  it('sem reforçar, não ganha vida', () => {
    const tg = fixture({ battlefield: [planicies(4), []], hand: [[N], []] });
    tg.number('quantas vezes', 0).cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.life(0)).toBe(40);
  });

  it('posta no campo sem ser conjurada, não foi reforçada e não ganha vida', () => {
    const tg = fixture({ battlefield: [planicies(4), []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
  });
});
