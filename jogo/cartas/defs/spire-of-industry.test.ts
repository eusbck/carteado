import { describe, expect, it } from 'vitest';
import { activateMana } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Spire of Industry';

describe(N, () => {
  it('{C}; com um artefato, também qualquer cor pagando 1 de vida', () => {
    expect(alternativasDeMana(N)).toEqual(['C']);
    expect(alternativasDeMana(N, ['Sol Ring'])).toEqual(['B', 'C', 'G', 'R', 'U', 'W']);
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    activateMana(tg, N, 'U');
    expect(tg.life(0)).toBe(39);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['U']);
  });
});
