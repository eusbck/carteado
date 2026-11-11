import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Elvish Reclaimer";

describe(C, () => {
  it('+2/+2 com três terrenos no cemitério', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Forest', 'Island', 'Swamp'], []] });
    expect(tg.pt(tg.bf(C))).toEqual([3, 4]);
  });
});
