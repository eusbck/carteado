import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Tower Defense', () => {
  it('CR 611.2c: criaturas que chegam depois não ganham', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Wall of Omens'], ['Elvish Mystic']], hand: [['Tower Defense'], []] });
    tg.cast('Tower Defense').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 9]);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'reach')).toBe(true);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.pt(tg.bf('Saproling'))).toEqual([1, 1]);
  });
});
