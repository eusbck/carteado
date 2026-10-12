import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hercules, Olympian Hero';

describe(N, () => {
  it('atacando ganha um marcador +1/+1 e indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers', 0);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
  });

  it('a primeira vez que recebe dano no turno vira marcadores +1/+1; a segunda, não', () => {
    const tg = setup({ battlefield: [[N], ['Silver Myr', 'Elvish Mystic']] });
    const h = tg.bf(N);
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'obj', id: h }, amount: 1, combat: false }, { source: tg.bf('Elvish Mystic'), target: { kind: 'obj', id: h }, amount: 1, combat: false }]);
    tg.refresh().resolveAll();
    expect(tg.pt(h)).toEqual([5, 5]);
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'obj', id: h }, amount: 1, combat: false }]);
    tg.refresh().resolveAll();
    expect(tg.pt(h)).toEqual([5, 5]);
  });
});