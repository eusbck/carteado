import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Furnace Whelp';

describe(N, () => {
  it('voar; {R}: +1/+0 até o fim do turno, quantas vezes quiser', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.activate(N).resolveAll();
    tg.activate(N).resolveAll();
    expect(tg.pt(id)).toEqual([4, 2]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(id)).toEqual([2, 2]);
  });
});