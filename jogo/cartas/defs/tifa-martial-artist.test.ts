import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Tifa, Martial Artist';

describe(C, () => {
  it('força 7 causa dano: desvira suas criaturas e há um combate a mais', () => {
    const tg = setup({ battlefield: [[C, { name: 'Colossus Hammer', attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', tapped: true }, { name: 'Wall of Omens', tapped: true }], []], step: 'combatDamage' });
    const fila = tg.state.turn.queue.length;
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 11, combat: true }]);
    tg.refresh().settle();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(false);
    expect(tg.state.turn.queue.length).toBeGreaterThan(fila);
  });
  it('força menor que 7 não dispara', () => {
    const tg = setup({ battlefield: [[C, { name: 'Wall of Omens', tapped: true }, 'Elvish Mystic'], []], step: 'combatDamage' });
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 1, combat: true }]);
    tg.refresh().settle();
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
