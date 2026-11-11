import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Cabal Coffers";

describe(C, () => {
  it('{2}, {T}: {B} para cada Swamp', () => {
    const tg = setup({ battlefield: [[C, ...Array(2).fill('Swamp')], []], hand: [['Endrek Sahr, Master Breeder'], []] });
    expect(tg.canCast('Endrek Sahr, Master Breeder')).toBe(false); // 2 pagam o Coffers, que dá só {B}{B}
    const tg2 = setup({ battlefield: [[C, ...Array(4).fill('Swamp')], []], hand: [['Endrek Sahr, Master Breeder'], []] });
    expect(tg2.canCast('Endrek Sahr, Master Breeder')).toBe(true); // 2 pagam o Coffers, que dá {B}x4, e sobram 2
  });
});
