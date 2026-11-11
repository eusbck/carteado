import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Lumra, Bellow of the Woods";

describe(C, () => {
  it('P/R igual aos terrenos', () => {
    const tg = setup({ battlefield: [[C, 'Forest', 'Forest', 'Forest'], []] });
    expect(tg.pt(tg.bf(C))).toEqual([3, 3]);
  });
});
