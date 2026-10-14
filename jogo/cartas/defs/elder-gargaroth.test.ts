import { describe, expect, it } from 'vitest';
import { hasKw, isAttacking } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Elder Gargaroth';

describe(N, () => {
  it('atacando, cria uma Beast 3/3 que não está atacando', () => {
    const tg = fixture({ battlefield: [[N], []] });
    expect(['reach', 'vigilance', 'trample'].every((k) => hasKw(tg.g, tg.bf(N), k))).toBe(true);
    tg.attack([[N, 1]]).choose('modo', ['Crie uma ficha de criatura Beast verde 3/3']).passTo('declareBlockers');
    const beast = tg.bf('Beast');
    expect(tg.pt(beast)).toEqual([3, 3]);
    expect(isAttacking(tg.g, beast)).toBe(false);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });

  it('bloqueando, pode ganhar 3 de vida', () => {
    const tg = fixture({ active: 1, battlefield: [[N], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', 0]]).block([[N, 'Indomitable Ancients']]).choose('modo', ['Você ganha 3 de vida']).passTo('combatDamage');
    expect(tg.life(0)).toBe(43);
  });
});
