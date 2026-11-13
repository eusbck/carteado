import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Teval, the Balanced Scale";

describe(C, () => {
  it('cartas saindo do cemitério criam Zombie Druid', () => {
    const tg = setup({ battlefield: [[C, 'Forest', 'Forest'], []], hand: [['Life from the Loam'], []], graveyard: [['Island'], []] });
    tg.choose('cartas de terreno', ['Island']).cast('Life from the Loam').resolveAll();
    expect(tg.all('Zombie Druid').length).toBeGreaterThanOrEqual(1);
  });
});
