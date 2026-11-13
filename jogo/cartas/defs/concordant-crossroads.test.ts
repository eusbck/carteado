import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Concordant Crossroads";

describe(C, () => {
  it('todas as criaturas têm ímpeto', () => {
    const tg = setup({ battlefield: [[C], ['Memnite']] });
    expect(hasKw(tg.g, tg.bf('Memnite'), 'haste')).toBe(true);
  });
});
