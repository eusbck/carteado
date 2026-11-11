import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Queen's Diamond";

describe(N, () => {
  it('sem marcadores não gera mana nem é criatura', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], command: [['Zetalpa, Primal Dawn'], []] });
    expect(chars(tg.g, tg.bf(N)).types).not.toContain('Creature');
    expect(tg.canCast('Zetalpa, Primal Dawn')).toBe(false);
  });

  it('com 8 marcadores é uma criatura 5/5 e a mana paga o comandante', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 8 } }], []], command: [['Zetalpa, Primal Dawn'], []] });
    expect(chars(tg.g, tg.bf(N)).types).toContain('Creature');
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(tg.canCast('Zetalpa, Primal Dawn')).toBe(true);
  });
});
