import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Ambition's Cost", () => {
  it('você compra três cartas e perde 3 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [["Ambition's Cost"], []], library: [['Island', 'Forest', 'Plains', 'Mountain'], ['Island']] });
    tg.cast("Ambition's Cost").resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
    expect(tg.life(0)).toBe(37);
    expect(tg.life(1)).toBe(40);
  });
});
