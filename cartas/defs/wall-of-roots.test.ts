import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

describe('Wall of Roots', () => {
  it('um {G} por turno, com um marcador -0/-1; vale até com enjoo de invocação', () => {
    const tg = setup({ battlefield: [[{ name: 'Wall of Roots', ready: false }], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic').resolve();
    const w = tg.bf('Wall of Roots');
    expect(tg.pt(w)).toEqual([0, 4]);
    expect(manaOptions(tg.g, 0).some((m) => m.obj === w)).toBe(false);
  });
});
