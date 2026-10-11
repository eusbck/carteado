import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Voice of the Blessed';

describe(N, () => {
  it('ganha um marcador +1/+1 a cada ganho de vida; com quatro tem voar e vigilância, com dez tem indestrutível', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(4);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    expect(hasKw(tg.g, id, 'indestructible')).toBe(false);
    tg.state.objects[id].counters['+1/+1'] = 10;
    tg.g.bump();
    expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
  });
});