import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Doran, Besieged by Time', () => {
  it('reduz só o genérico de criaturas com resistência maior que a força', () => {
    const tg = setup({ battlefield: [['Doran, Besieged by Time', 'Plains'], []], hand: [['Wall of Omens', 'Elvish Mystic'], []] });
    expect(tg.canCast('Wall of Omens')).toBe(true); // {1}{W} → {W}
    const tg2 = setup({ battlefield: [['Doran, Besieged by Time', 'Forest'], []], hand: [['Indomitable Ancients'], []] });
    expect(tg2.canCast('Indomitable Ancients')).toBe(false); // {2}{W}{W}: o {W}{W} continua
  });
  it('X calculado na resolução: a diferença é a maior menos a menor', () => {
    const tg = setup({ battlefield: [['Doran, Besieged by Time', 'Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([10, 18]);
  });
});
