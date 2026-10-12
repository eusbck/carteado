import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Steelbane Hydra';

describe(N, () => {
  it('entra com X marcadores +1/+1; {2}{G} e um marcador: destrói um artefato ou encantamento', () => {
    const tg = setup({ battlefield: [Array(8).fill('Forest'), ['Sol Ring']], hand: [[N], []] });
    tg.number('X', 3).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).activate(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.pt(id)).toEqual([2, 2]);
  });
});