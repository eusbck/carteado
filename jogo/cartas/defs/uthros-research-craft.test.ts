import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Uthros Research Craft';

describe(C, () => {
  it('com 3+ cargas, compra e ganha carga ao conjurar artefato; com 12+ é criatura voadora', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 11 } }, 'Island'], []], hand: [['Ornithopter'], []], library: [['Opt'], []] });
    expect(isCreature(tg.g, tg.bf(C))).toBe(false);
    tg.cast('Ornithopter').resolveAll();
    expect(tg.names(0, 'hand')).toContain('Opt');
    expect(isCreature(tg.g, tg.bf(C))).toBe(true);
    expect(hasKw(tg.g, tg.bf(C), 'flying')).toBe(true);
    expect(tg.pt(tg.bf(C))).toEqual([2, 8]); // Uthros e Ornithopter
  });
});
