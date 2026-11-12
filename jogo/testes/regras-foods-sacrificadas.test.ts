// foods-a: contagem do turno das Foods sacrificadas (TurnStats.foodsSacrificed), para "se você sacrificou uma Food neste
// turno" (Elanor Gardner).
import { describe, expect, it } from 'vitest';
import { sacrifice } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

describe('Foods sacrificadas no turno (CR 701.21a, 205.3g)', () => {
  it('701.21a: sacrificar uma Food (pela habilidade dela ou por efeito) conta para quem a controlava', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: 'Food', token: true }, { name: 'Food', token: true }, 'Elvish Mystic'], []] });
    expect(tg.state.turnStats[0].foodsSacrificed ?? 0).toBe(0);
    tg.activate('Food').resolveAll();
    expect(tg.state.turnStats[0].foodsSacrificed).toBe(1);
    runEffect(tg, sacrifice(tg.g, [tg.bf('Food')]));
    expect(tg.state.turnStats[0].foodsSacrificed).toBe(2);
    expect(tg.state.turnStats[1].foodsSacrificed ?? 0).toBe(0);
  });

  it('205.3g: só Foods contam; sacrificar outra permanente não conta, e a contagem zera no turno seguinte', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', { name: 'Treasure', token: true }, { name: 'Food', token: true }], []] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Treasure')]));
    expect(tg.state.turnStats[0].foodsSacrificed ?? 0).toBe(0);
    runEffect(tg, sacrifice(tg.g, [tg.bf('Food')]));
    expect(tg.state.turnStats[0].foodsSacrificed).toBe(1);
    tg.passTo('main1', 1);
    expect(tg.state.turnStats[0].foodsSacrificed ?? 0).toBe(0);
  });
});
