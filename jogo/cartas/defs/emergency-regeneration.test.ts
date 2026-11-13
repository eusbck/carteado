import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Emergency Regeneration';

describe(N, () => {
  it('os seus artefatos ganham resistência a magia e indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Sol Ring', 'Wall of Omens'], ['Steel Overseer']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Steel Overseer'), 'indestructible')).toBe(false);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'indestructible')).toBe(false);
  });
});
