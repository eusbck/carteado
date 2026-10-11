import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sundering Growth';

describe(N, () => {
  it('destrói o artefato ou encantamento alvo e depois popula', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains', { name: 'Horse', token: true }], ['Sol Ring']], hand: [[N], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.all('Horse')).toHaveLength(2);
  });
});