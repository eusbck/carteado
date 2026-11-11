import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = "Queen's Diamond";

describe(C, () => {
  it('com 8+ cargas é criatura com voar, vigilância e ímpeto', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 8 } }], []] });
    for (const kw of ['flying', 'vigilance', 'haste']) expect(hasKw(tg.g, tg.bf(C), kw)).toBe(true);
  });
});
