import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Martial Impetus', () => {
  it('a criatura goadada precisa atacar outro jogador; as outras que atacam seus oponentes recebem +1/+1', () => {
    const tg = setup({
      players: 3, active: 1, battlefield: [[{ name: 'Martial Impetus', attachTo: 'Gau, Feral Youth' }], ['Gau, Feral Youth', 'Elvish Mystic'], []],
      library: [['Island'], ['Island'], ['Island']],
    });
    const gau = tg.bf('Gau, Feral Youth');
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [[gau, { kind: 'player', id: 0 }]] }));
      return { kind: 'attackers', attacks: [[gau, { kind: 'player', id: 2 }], [tg.bf('Elvish Mystic'), { kind: 'player', id: 2 }]] };
    });
    tg.passTo('declareAttackers').resolveAll();
    expect(erros[0]).toMatch(/508.1d/);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(gau)).toEqual([4, 4]); // 2/2 + Aura + fúria
  });
});
