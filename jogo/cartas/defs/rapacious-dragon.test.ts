import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const R = 'Rapacious Dragon';

describe(R, () => {
  it('voar; ao entrar, cria duas fichas de Tesouro', () => {
    const tg = setup({ battlefield: [Array(5).fill('Mountain'), []], hand: [[R], []] });
    tg.cast(R).resolveAll();
    expect(hasKw(tg.g, tg.bf(R), 'flying')).toBe(true);
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure')).toHaveLength(2);
    expect(tg.pt(tg.bf(R))).toEqual([3, 3]);
  });
});
