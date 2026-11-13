import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ambulatory Reactor';

describe(N, () => {
  it('as criaturas artefato geram {C} que só paga mágicas de artefato', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []], hand: [['Steel Overseer', 'Wall of Omens'], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf('Borg'))).toBe(true);
    // Steel Overseer custa {2}: o Reator e a ficha pagam; o Muro ({1}{W}) não
    expect(tg.canCast('Steel Overseer')).toBe(true);
    expect(tg.canCast('Wall of Omens')).toBe(false);
    tg.cast('Steel Overseer').resolveAll();
    expect(tg.find('Steel Overseer')).not.toBeNull();
  });
});
