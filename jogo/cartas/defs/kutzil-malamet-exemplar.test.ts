import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Kutzil, Malamet Exemplar';

describe(C, () => {
  it('seus oponentes não podem conjurar mágicas durante o seu turno', () => {
    const tg = setup({ battlefield: [[C], ['Island']], hand: [[], ['Opt']] });
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Opt')).toBe(false);
  });
  it('criatura com força acima da impressa dá a compra; sem bônus, não', () => {
    const tg = setup({ battlefield: [[C, { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }, 'Wall of Omens'], []], library: [['Opt', 'Opt'], []] });
    dealDamage(tg.g, [{ source: tg.bf('Wall of Omens'), target: { kind: 'player', id: 1 }, amount: 1, combat: true }]);
    tg.refresh().settle();
    expect(tg.state.zones.stack.length).toBe(0);
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 2, combat: true }]);
    tg.refresh().settle();
    tg.resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
});
