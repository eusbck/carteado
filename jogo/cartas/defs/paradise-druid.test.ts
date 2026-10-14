import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { activateMana } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Paradise Druid';

describe(N, () => {
  it('uma mana de qualquer cor; resistência a magia só enquanto desvirada', () => {
    expect(alternativasDeMana(N)).toEqual(['B', 'G', 'R', 'U', 'W']);
    const tg = setup({ battlefield: [[N], []] });
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(true);
    activateMana(tg, N, 'G');
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(false);
  });
});
