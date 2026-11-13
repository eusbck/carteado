import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/api.ts';

describe('Universal Automaton', () => {
  it('CR 702.73a: é de todos os tipos de criatura (Ninja inclusive)', () => {
    const tg = setup({ battlefield: [['Universal Automaton'], []] });
    const ch = chars(tg.g, tg.bf('Universal Automaton'));
    expect(ch.subtypes).toContain('Ninja');
    expect(ch.subtypes).toContain('Rogue');
  });
});
