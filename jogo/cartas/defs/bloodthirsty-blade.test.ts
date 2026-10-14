import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Bloodthirsty Blade';
const lib = Array(5).fill('Island');

describe(NOME, () => {
  it('{1}: anexa à criatura de um oponente, que recebe +2/+0 e precisa atacar alguém que não você', () => {
    const tg = setup({ players: 3, battlefield: [[NOME, 'Plains'], ['Indomitable Ancients'], []], library: [lib, lib, lib] });
    tg.choose('criatura alvo que um oponente', ['Indomitable Ancients']).activate(NOME, 'Anexe').resolve();
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[tg.bf(NOME)].attachedTo).toBe(anc);
    expect(tg.pt(anc)).toEqual([4, 10]);
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers' || d.player !== 1) return null;
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [] }));
      erros.push(x.game.check(1, { kind: 'attackers', attacks: [[anc, { kind: 'player', id: 0 }]] }));
      return { kind: 'attackers', attacks: [[anc, { kind: 'player', id: 2 }]] };
    });
    tg.passTo('main2', 1);
    expect(erros.every((e) => e && /508.1d/.test(e))).toBe(true);
    expect(tg.life(2)).toBe(36);
  });

  it('só mira criaturas de oponentes', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Wall of Omens'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(tg.bf(NOME))))).toBe(false);
  });
});
