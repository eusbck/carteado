import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Enduring Tenacity";

describe(C, () => {
  it('ao morrer volta como encantamento que não é criatura', () => {
    const tg = setup({ battlefield: [[C, 'Swamp'], []], hand: [['Innocent Blood'], []], library: [['Opt'], []] });
    tg.cast('Innocent Blood').resolve().resolveAll();
    const id = tg.bf(C);
    expect(isCreature(tg.g, id)).toBe(false);
  });
});
