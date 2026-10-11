import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Song of the Worldsoul';

describe(N, () => {
  it('conjurando uma mágica, você popula antes de ela resolver', () => {
    const tg = setup({ battlefield: [[N, 'Island', { name: 'Horse', token: true }], ['Island']], hand: [['Sol Ring'], ['Sol Ring']] });
    tg.cast('Sol Ring').resolve();
    // o gatilho resolveu; Sol Ring ainda está na pilha
    expect(tg.all('Horse')).toHaveLength(2);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    // a mágica do oponente não dispara
    tg.passTo('main1', 1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Horse')).toHaveLength(2);
  });
});