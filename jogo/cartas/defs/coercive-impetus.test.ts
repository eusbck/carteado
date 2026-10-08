import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Coercive Impetus', () => {
  it('precisa atacar alguém que não seja quem goadou; ao atacar, você compra e perde 1', () => {
    // a Aura de Ana encanta a criatura de Bruno
    const tg2 = setup({ players: 3, active: 1, battlefield: [[{ name: 'Coercive Impetus', attachTo: 'Indomitable Ancients' }], ['Indomitable Ancients'], []], library: [['Island'], ['Island'], ['Island']] });
    const erros: (string | null)[] = [];
    const anc = tg2.bf('Indomitable Ancients');
    expect(tg2.pt(anc)).toEqual([3, 11]);
    tg2.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [] }));
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [[anc, { kind: 'player', id: 0 }]] }));
      return { kind: 'attackers', attacks: [[anc, { kind: 'player', id: 2 }]] };
    });
    tg2.passTo('declareBlockers');
    tg2.resolveAll();
    expect(erros.every((e) => e && /508.1d/.test(e))).toBe(true);
    expect(tg2.names(0, 'hand')).toEqual(['Island']);
    expect(tg2.life(0)).toBe(39);
  });
});
