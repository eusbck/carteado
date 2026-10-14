import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Challenger Troll';
const bloqueadores = ['Indomitable Ancients', 'Wall of Omens'];

describe(N, () => {
  it('a criatura com força 4 ou mais (ela mesma também) não pode ser bloqueada por duas; a de força menor pode', () => {
    const tg = fixture({ battlefield: [[N, 'Elvish Mystic'], bloqueadores] });
    tg.attack([[N, 1]]).block([['Indomitable Ancients', N], ['Wall of Omens', N]]);
    expect(() => tg.passTo('declareBlockers')).toThrow(/não pode ser bloqueada por mais de 1/);

    const ok = fixture({ battlefield: [[N, 'Elvish Mystic'], bloqueadores] });
    ok.attack([[N, 1]]).block([['Indomitable Ancients', N]]).passTo('combatDamage');
    expect(ok.state.objects[ok.bf('Indomitable Ancients')].damage).toBe(6);

    const fraca = fixture({ battlefield: [[N, 'Elvish Mystic'], bloqueadores] });
    fraca.attack([['Elvish Mystic', 1]]).block([['Indomitable Ancients', 'Elvish Mystic'], ['Wall of Omens', 'Elvish Mystic']]).passTo('combatDamage');
    expect(fraca.find('Elvish Mystic')).toBeNull();
  });

  it('com ameaçar e força 4 ou mais, não pode ser bloqueada', () => {
    const tg = fixture({ battlefield: [[N], bloqueadores] });
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf(N) }, [tg.bf(N)], [{ k: 'addKeyword', kw: 'menace' }]);
    tg.refresh();
    tg.attack([[N, 1]]).block([['Indomitable Ancients', N], ['Wall of Omens', N]]);
    expect(() => tg.passTo('declareBlockers')).toThrow(/não pode ser bloqueada por mais de 1/);
  });
});
