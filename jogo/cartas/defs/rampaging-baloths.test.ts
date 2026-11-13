import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Rampaging Baloths";

describe(C, () => {
  it('queda de terreno: Beast 4/4', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.all('Beast')[0])).toEqual([4, 4]);
  });
});
