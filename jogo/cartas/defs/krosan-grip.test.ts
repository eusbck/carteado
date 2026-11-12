import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Krosan Grip';

describe(N, () => {
  it('destrói o artefato ou encantamento alvo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).cast(N).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
  it('com ela na pilha, o oponente não pode conjurar mágicas', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Sol Ring', 'Island', 'Island']], hand: [[N], ['Counterspell']] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).cast(N);
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
  });
});
