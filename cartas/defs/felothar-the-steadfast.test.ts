import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Felothar the Steadfast', () => {
  it('defensores atacam e causam dano pela resistência; só o dano atribuído muda, a força continua', () => {
    const tg = setup({ battlefield: [['Felothar the Steadfast', 'Wall of Omens'], []] });
    tg.attack([['Wall of Omens', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(36);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('{3}, {T}, sacrifique: compra pela resistência e descarta pela força', () => {
    const tg = setup({ battlefield: [['Felothar the Steadfast', 'Indomitable Ancients', 'Plains', 'Plains', 'Plains'], []], library: [Array(10).fill('Island'), []] });
    tg.choose('escarte', ['Island', 'Island']).activate('Felothar the Steadfast').resolve();
    expect(tg.names(0, 'hand').length).toBe(8);
  });
});
