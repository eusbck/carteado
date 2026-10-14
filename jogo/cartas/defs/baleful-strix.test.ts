import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Baleful Strix';

describe(N, () => {
  it('voar e toque mortífero; ao entrar, compra uma carta', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[N], []], library: [['Forest', 'Plains'], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
