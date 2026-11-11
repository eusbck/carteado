import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'The Reality Chip';

describe(C, () => {
  it('anexado a uma criatura, deixa conjurar do topo do grimório', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Wall of Omens' }, 'Wall of Omens', 'Forest'], []], library: [['Elvish Mystic'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(true);
  });
  it('sem estar anexado, não deixa', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []], library: [['Elvish Mystic'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
});
