import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hedron Crab';

describe(N, () => {
  it('jogando um terreno, o jogador alvo mói três cartas', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []], library: [[], ['Hex', 'Hex', 'Hex', 'Island']] });
    tg.choose('jogador alvo', ['Bruno']).play('Forest').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Hex', 'Hex', 'Hex']);
    expect(tg.names(1, 'library')).toEqual(['Island']);
  });
});
