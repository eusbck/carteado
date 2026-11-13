import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Bramblewood Paragon', () => {
  it('o outro Guerreiro entra com um marcador +1/+1 e ganha atropelar; criatura sem marcador não', () => {
    const tg = setup({ battlefield: [['Bramblewood Paragon', 'Forest', 'Forest', 'Forest'], []], hand: [["Dwynen's Elite", 'Llanowar Elves'], []] });
    tg.cast("Dwynen's Elite").resolve();
    tg.resolveAll();
    tg.cast('Llanowar Elves').resolve();
    const elite = tg.bf("Dwynen's Elite");
    expect(tg.state.objects[elite].counters['+1/+1']).toBe(1);
    expect(hasKw(tg.g, elite, 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Llanowar Elves'), 'trample')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Bramblewood Paragon'), 'trample')).toBe(false);
  });
});
