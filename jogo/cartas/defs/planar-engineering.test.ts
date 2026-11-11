import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Planar Engineering";

describe(C, () => {
  it('sacrifica dois e busca quatro básicos', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest')], []], hand: [[C], []], library: [['Island', 'Island', 'Swamp', 'Swamp'], []] });
    tg.lenient = true;
    tg.choose('quatro cartas', ['Island', 'Island', 'Swamp', 'Swamp']).cast(C).resolve();
    expect(tg.state.zones.battlefield.length).toBe(6);
  });
});
