import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Moonshaker Cavalry', () => {
  it('X fixado na resolução, contando a própria Cavalry; criaturas que entram depois não são afetadas', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Plains'), 'Wall of Omens'], []], hand: [['Moonshaker Cavalry'], []] });
    tg.cast('Moonshaker Cavalry').resolve().resolve();
    expect(tg.pt(tg.bf('Moonshaker Cavalry'))).toEqual([8, 8]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'flying')).toBe(true);
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.pt(tg.bf('Saproling'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
  });
});
