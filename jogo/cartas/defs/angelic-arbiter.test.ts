import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Angelic Arbiter';

describe(N, () => {
  it('o oponente que conjurou uma mágica neste turno não pode atacar com criaturas', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Indomitable Ancients', 'Island']], hand: [[], ['Sol Ring']] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 6]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(attackCandidates(tg.g, 1)).toHaveLength(1);
    tg.cast('Sol Ring').resolveAll();
    expect(attackCandidates(tg.g, 1)).toHaveLength(0);
  });

  it('o oponente que atacou com uma criatura neste turno não pode conjurar mágicas', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Indomitable Ancients', 'Island']], hand: [[], ['Sol Ring']] });
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.canCast('Sol Ring')).toBe(false);
  });

  it('no seu turno, você conjura mágicas e ataca normalmente', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(attackCandidates(tg.g, 0)).toHaveLength(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
  });
});