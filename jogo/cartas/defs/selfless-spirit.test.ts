import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Selfless Spirit', () => {
  it('CR 611.2c: criaturas que você passa a controlar depois não ganham', () => {
    const tg = setup({ battlefield: [['Selfless Spirit', 'Wall of Omens'], ['Wall of Omens']] });
    tg.activate('Selfless Spirit').resolve();
    tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(hasKw(tg.g, tg.bf('Wall of Omens', 0), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens', 1), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Saproling'), 'indestructible')).toBe(false);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Wall of Omens', 0), 'indestructible')).toBe(false);
  });
});
