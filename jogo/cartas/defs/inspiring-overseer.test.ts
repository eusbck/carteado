import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Inspiring Overseer';

describe(N, () => {
  it('voar; ao entrar, você ganha 1 de vida e compra uma carta', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[N], []], library: [['Forest', 'Island'], []] });
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
