import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Essence Flux', () => {
  it('pisca a criatura e volta como objeto novo', () => {
    const tg = setup({ battlefield: [['Island', 'Elvish Mystic'], []], hand: [['Essence Flux'], []] });
    const antes = tg.bf('Elvish Mystic');
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Essence Flux').resolve();
    expect(tg.bf('Elvish Mystic')).not.toBe(antes);
  });
});
