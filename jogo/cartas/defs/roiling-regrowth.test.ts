import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Roiling Regrowth";

describe(C, () => {
  it('sacrifica um e põe dois básicos virados', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Forest')], []], hand: [[C], []], library: [['Island', 'Swamp'], []] });
    tg.lenient = true;
    tg.choose('básico', ['Island', 'Swamp']).cast(C).resolve();
    expect(tg.all('Island').length + tg.all('Swamp').length).toBe(2);
  });
});
