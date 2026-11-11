import { describe, expect, it } from 'vitest';
import { isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Thassa, Deep-Dwelling';

describe(C, () => {
  it('com devoção ao azul menor que cinco não é criatura; pisca outra criatura na etapa final', () => {
    const tg = setup({ battlefield: [[C, 'Wall of Omens'], []], library: [['Opt', 'Opt'], ['Opt']] });
    expect(isCreature(tg.g, tg.bf(C))).toBe(false);
    const antes = tg.bf('Wall of Omens');
    tg.choose('outra criatura', ['Wall of Omens']);
    tg.passTo('end').resolveAll();
    expect(tg.bf('Wall of Omens')).not.toBe(antes);
  });
});
