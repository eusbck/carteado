// "Você pode gastar mana como se fosse mana de qualquer cor" (CR 609.4b): muda só como se paga; qualquer mana paga
// um símbolo colorido, mas o {C} de um custo continua pedindo mana incolor (CR 107.4c). Gancho spendAsAnyColor
// (motor/defs.ts), aplicado em motor/costs.ts; o casamento da reserva é matchPool em motor/mana.ts (anyColor).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { matchPool, parseCost } from '../motor/mana.ts';
import { canAfford } from '../motor/costs.ts';
import type { ManaUnit } from '../motor/types.ts';

const pool = (...t: string[]): ManaUnit[] => t.map((type) => ({ type: type as ManaUnit['type'], source: null }));

describe('Gastar mana como se fosse de qualquer cor (CR 609.4b)', () => {
  it('matchPool com anyColor: qualquer mana paga símbolo colorido; {C} só com incolor', () => {
    expect(matchPool(parseCost('{W}{W}'), pool('U', 'C'))).toBeNull();
    expect(matchPool(parseCost('{W}{W}'), pool('U', 'C'), { anyColor: true })).not.toBeNull();
    expect(matchPool(parseCost('{C}'), pool('U'), { anyColor: true })).toBeNull();
    expect(matchPool(parseCost('{C}'), pool('C'), { anyColor: true })).not.toBeNull();
  });
  it('com Chromatic Orrery, o controlador paga custos coloridos com qualquer mana; o oponente não', () => {
    const tg = setup({ battlefield: [[{ name: 'Chromatic Orrery', tapped: true }, 'Island', 'Island'], ['Island', 'Island']] });
    expect(canAfford(tg.g, 0, parseCost('{R}{G}'), { purpose: { kind: 'effect' } })).toBe(true);
    expect(canAfford(tg.g, 1, parseCost('{R}{G}'), { purpose: { kind: 'effect' } })).toBe(false);
  });
});
