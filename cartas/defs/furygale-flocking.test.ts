import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Furygale Flocking', () => {
  it('custa menos por instantânea e feitiço no cemitério; cada par é obrigado a atacar o seu oponente', () => {
    const tg = setup({
      players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], [], []], hand: [['Furygale Flocking'], [], []],
      graveyard: [['Abrade', "Night's Whisper", 'Counterspell', 'Negate', 'Infernal Grasp', 'Swords to Plowshares'], [], []], library: [[], ['Island'], ['Island']],
    });
    tg.cast('Furygale Flocking').resolve();
    const els = tg.all('Elemental');
    expect(els.length).toBe(4);
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(0, { kind: 'attackers', attacks: els.map((id) => [id, { kind: 'player', id: 1 }]) }));
      return { kind: 'attackers', attacks: els.map((id, i) => [id, { kind: 'player', id: i < 2 ? 1 : 2 }]) };
    });
    tg.passTo('main2');
    expect(erros[0]).toMatch(/508.1d/);
    expect([tg.life(1), tg.life(2)]).toEqual([34, 34]);
  });
});
