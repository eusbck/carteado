import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Ajani's Pridemate";

describe(N, () => {
  it('um marcador +1/+1 por evento de ganho de vida, seja de quanto for', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    gainLife(tg.g, 0, 4, null);
    tg.refresh().resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    // o ganho de vida do oponente não conta
    gainLife(tg.g, 1, 3, null);
    tg.refresh().resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
  });
});