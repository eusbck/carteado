import { describe, expect, it } from 'vitest';
import { hasKw, isAttacking } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Rhonas the Indomitable';

describe(N, () => {
  it('sem outra criatura de força 4 ou mais, não ataca', () => {
    const tg = fixture({ battlefield: [[N, 'Indomitable Ancients'], []] });
    tg.attack([[N, 1]]);
    expect(() => tg.passTo('declareBlockers')).toThrow();
  });

  it('com outra criatura de força 4 ou mais, Rhonas ataca sozinho', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []] });
    tg.attack([[N, 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(35);
  });

  it('não bloqueia sem outra criatura de força 4 ou mais', () => {
    const tg = fixture({ active: 1, battlefield: [[N, 'Indomitable Ancients'], ['Elvish Mystic']] });
    tg.attack([['Elvish Mystic', 0]]).block([[N, 'Elvish Mystic']]);
    expect(() => tg.passTo('combatDamage')).toThrow();
  });

  it('{2}{G}: outra criatura alvo recebe +2/+0 e atropelar', () => {
    const tg = fixture({ battlefield: [[N, 'Indomitable Ancients', 'Forest', 'Forest', 'Forest'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch') && hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    tg.choose('outra criatura alvo', ['Indomitable Ancients']).activate(N).resolve();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.pt(a)).toEqual([4, 10]);
    expect(hasKw(tg.g, a, 'trample')).toBe(true);
    // agora há outra criatura com força 4: Rhonas pode atacar
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(isAttacking(tg.g, tg.bf(N))).toBe(true);
  });
});
