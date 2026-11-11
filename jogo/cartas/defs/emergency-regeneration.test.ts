import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Emergency Regeneration', () => {
  it('artefatos ganham resistência a magia e indestrutível', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Sol Ring', 'Elvish Mystic'], []], hand: [['Emergency Regeneration'], []] });
    tg.cast('Emergency Regeneration').resolve();
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(false);
  });
});
