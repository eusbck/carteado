import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Summoning Materia';

describe(C, () => {
  it('equipada: +2/+2, vigilância e mana; conjura criatura do topo do grimório', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Wall of Omens' }, 'Wall of Omens', 'Forest'], []], library: [['Elvish Mystic', 'Opt'], []] });
    const wall = tg.bf('Wall of Omens');
    expect(tg.pt(wall)).toEqual([2, 6]);
    expect(hasKw(tg.g, wall, 'vigilance')).toBe(true);
    expect(tg.canCast('Elvish Mystic')).toBe(true);
  });
  it('sem estar anexada, não deixa conjurar do topo', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []], library: [['Elvish Mystic'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
});
