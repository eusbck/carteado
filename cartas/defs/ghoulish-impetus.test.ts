import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Ghoulish Impetus', () => {
  it('a criatura goadada precisa atacar outro jogador; volta ao campo na próxima etapa final', () => {
    const tg = setup({
      players: 3, active: 1, battlefield: [[{ name: 'Ghoulish Impetus', attachTo: 'Elvish Mystic' }], ['Elvish Mystic', 'Wall of Omens'], []], library: [['Island'], ['Island'], ['Island']],
    });
    const m = tg.bf('Elvish Mystic');
    expect(tg.pt(m)).toEqual([2, 2]);
    expect(hasKw(tg.g, m, 'deathtouch')).toBe(true);
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [] }), x.game.check(1, { kind: 'attackers', attacks: [[m, { kind: 'player', id: 0 }]] }));
      return { kind: 'attackers', attacks: [[m, { kind: 'player', id: 2 }]] };
    });
    tg.passTo('main2');
    expect(erros[0]).toMatch(/508.1d/);
    expect(erros[1]).toMatch(/508.1d/);
    tg.run(destroy(tg.g, [m]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Ghoulish Impetus']);
    tg.choose('encantar', ['Wall of Omens']);
    tg.passTo('end').resolve();
    expect(tg.state.objects[tg.bf('Ghoulish Impetus')].attachedTo).toBe(tg.bf('Wall of Omens'));
  });
});
