import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Parallel Lives";

describe(C, () => {
  it('o dobro das fichas', () => {
    const tg = setup({ battlefield: [[C, 'Rampaging Baloths'], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.all('Beast').length).toBe(2);
  });
});
