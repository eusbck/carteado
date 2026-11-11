import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Aftermath Analyst";

describe(C, () => {
  it('devolve terrenos do cemitério', () => {
    const tg = setup({ battlefield: [[C, ...Array(4).fill('Forest')], []], graveyard: [['Island'], []] });
    tg.activate(C).resolve();
    expect(tg.find('Island')).not.toBeNull();
  });
});
