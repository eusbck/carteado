import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Assault Formation', () => {
  it('uma criatura 0/4 atribui 4; a força continua a mesma; {G} deixa o defensor atacar', () => {
    const tg = setup({ battlefield: [['Assault Formation', 'Wall of Omens', 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.choose('criatura alvo com defensor', ['Wall of Omens']).activate('Assault Formation', 'como se não tivesse defensor').resolve();
    tg.activate('Assault Formation', '+0/+1').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 5]);
    tg.attack([['Wall of Omens', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(35);
  });
  it('sem a ativação, o defensor não pode atacar', () => {
    const tg = setup({ battlefield: [['Assault Formation', 'Wall of Omens'], []] });
    tg.passUntil((x) => x.pending?.kind === 'attackers' || x.state.turn.step === 'main2');
    expect(tg.pending?.kind === 'attackers' && tg.pending.candidates.some((c) => c.obj === tg.bf('Wall of Omens'))).toBe(false);
  });
});
