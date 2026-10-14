import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Take the Bait';
const lib = Array(6).fill('Island');

describe(NOME, () => {
  it('no combate de Bruno: o dano a você é prevenido, os atacantes desviram goadados e há outro combate, em que precisam atacar Carla', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Mountain', 'Plains', 'Mountain', 'Plains'], ['Indomitable Ancients'], []], hand: [[NOME], [], []], library: [lib, lib, lib] });
    const anc = tg.bf('Indomitable Ancients');
    tg.attack([['Indomitable Ancients', 0]]);
    tg.passUntil((x) => x.pending?.player === 0 && x.state.turn.step === 'declareAttackers');
    tg.cast(NOME).resolve();
    expect(tg.state.objects[anc].tapped).toBe(false);
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
    // segundo combate: precisa atacar Carla
    tg.attack([[anc, 2]]);
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
    expect(tg.life(2)).toBe(38);
    expect(tg.state.turn.combatCount).toBe(2);
  });

  it('só durante o combate no turno de um oponente', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Plains', 'Mountain', 'Plains'], []], hand: [[NOME], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast(NOME)).toBe(false);
  });
});
