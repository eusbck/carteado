import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Parasitic Impetus', () => {
  it('você ganha a vida, não o controlador da criatura', () => {
    const tg = setup({
      players: 3, active: 1, battlefield: [[{ name: 'Parasitic Impetus', attachTo: 'Elvish Mystic' }], ['Elvish Mystic'], []], library: [['Island'], ['Island'], ['Island']],
    });
    const m = tg.bf('Elvish Mystic');
    expect(tg.pt(m)).toEqual([3, 3]);
    tg.script.push((d) => (d.kind === 'attackers' ? { kind: 'attackers', attacks: [[m, { kind: 'player', id: 2 }]] } : null));
    tg.passTo('declareAttackers').resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
});
