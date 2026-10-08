import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Sage's Reverie", () => {
  it('na resolução, conta a própria Aura; conta Auras suas presas a criaturas de qualquer jogador', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Elvish Mystic', { name: 'Martial Impetus', attachTo: 'Elvish Mystic' }]],
      hand: [["Sage's Reverie"], []], library: [['Island', 'Island', 'Island'], ['Island']],
    });
    // Martial Impetus é de Bruno: não conta para Ana
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast("Sage's Reverie").resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
  it('Aura sua na criatura de um oponente também conta', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', { name: 'Ethereal Armor', attachTo: 'Elvish Mystic' }], ['Elvish Mystic']],
      hand: [["Sage's Reverie"], []], library: [['Island', 'Island', 'Island'], ['Island']],
    });
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast("Sage's Reverie").resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
  });
});
