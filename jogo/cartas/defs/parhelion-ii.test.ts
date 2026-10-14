import { describe, expect, it } from 'vitest';
import { hasKw, isAttacking } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Parhelion II';

describe(N, () => {
  it('ao atacar, cria duas Angels 4/4 atacando, que causam dano', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'first strike')).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const anjos = tg.all('Angel');
    expect(anjos).toHaveLength(2);
    for (const a of anjos) {
      expect(isAttacking(tg.g, a)).toBe(true);
      expect(tg.pt(a)).toEqual([4, 4]);
      expect(hasKw(tg.g, a, 'vigilance')).toBe(true);
    }
    tg.passTo('main2');
    expect(tg.life(1)).toBe(27);
  });
});
