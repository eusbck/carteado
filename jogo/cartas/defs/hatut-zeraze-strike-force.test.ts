import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hatut Zeraze Strike Force';

describe(N, () => {
  it('entrando, destrói até um artefato ou encantamento alvo; sem ter conjurado o comandante, não há cópias', () => {
    const tg = setup({ battlefield: [Array(4).fill('Plains'), ['Sol Ring']], hand: [[N], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']);
    tg.cast(N).resolveAll();
    expect(tg.all(N)).toHaveLength(1);
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('copia a mágica para cada vez que você conjurou o seu comandante da zona de comando', () => {
    const tg = setup({ battlefield: [Array(4).fill('Plains'), []], hand: [[N], []] });
    tg.state.players[0].commanderCasts = { 1: 2 };
    tg.cast(N).resolveAll();
    const todas = tg.all(N);
    expect(todas).toHaveLength(3);
    expect(todas.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });
});