import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Thrashing Brontodon';

describe(N, () => {
  it('{1}, sacrifique: destrói o artefato ou encantamento alvo', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], ['Sol Ring']] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).activate(N).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
});
