import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Eriette of the Charmed Apple', () => {
  it('criatura encantada por Aura sua não pode atacar você', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Eriette of the Charmed Apple', { name: 'Angelic Gift', attachTo: 'Indomitable Ancients' }], ['Indomitable Ancients'], []], library: [['Island'], ['Island'], ['Island']] });
    let alvos: unknown[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      alvos = d.candidates.find((c) => c.obj === tg.bf('Indomitable Ancients'))?.targets ?? [];
      return { kind: 'attackers', attacks: [] };
    });
    tg.passTo('main2');
    expect(alvos).toEqual([{ kind: 'player', id: 2 }]);
  });
  it('X conta as Auras na resolução', () => {
    const tg = setup({ battlefield: [['Eriette of the Charmed Apple', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }, { name: 'Ethereal Armor', attachTo: 'Wall of Omens' }], []], library: [[], ['Island']] });
    tg.passTo('end');
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
});
