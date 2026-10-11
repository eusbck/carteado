import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Storm Herd';

describe(N, () => {
  it('cria X Pegasus 1/1 brancos com voar, X igual ao seu total de vida', () => {
    const tg = setup({ battlefield: [Array(10).fill('Plains'), []], hand: [[N], []] });
    tg.state.players[0].life = 7;
    tg.cast(N).resolveAll();
    const fichas = tg.all('Pegasus');
    expect(fichas).toHaveLength(7);
    expect(tg.pt(fichas[0])).toEqual([1, 1]);
    expect(hasKw(tg.g, fichas[0], 'flying')).toBe(true);
  });
});