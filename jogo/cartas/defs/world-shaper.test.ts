import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "World Shaper";

describe(C, () => {
  it('ao morrer devolve terrenos do cemitério', () => {
    const tg = setup({ battlefield: [[C, 'Swamp'], []], hand: [['Innocent Blood'], []], graveyard: [['Island'], []] });
    tg.cast('Innocent Blood').resolve().resolveAll();
    expect(tg.find('Island')).not.toBeNull();
  });
});
