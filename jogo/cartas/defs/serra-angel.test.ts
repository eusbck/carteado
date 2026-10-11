import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Serra Angel';

describe(N, () => {
  it('4/4 com voar e vigilância: atacar não a vira', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.state.objects[id].tapped).toBe(false);
  });
});