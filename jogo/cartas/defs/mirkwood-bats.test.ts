import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mirkwood Bats";

describe(C, () => {
  it('criar ou sacrificar ficha faz cada oponente perder 1', () => {
    const tg = setup({ battlefield: [[C, 'Warren Soultrader', 'Memnite'], []] });
    tg.choose('outra criatura', ['Memnite']).activate('Warren Soultrader').resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
