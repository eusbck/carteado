import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Invisible Woman';
const QUATRO = ['Mountain', 'Forest', 'Plains', 'Island'];

describe(N, () => {
  it('no início do combate, cria um Wall 0/3 com defensor e alcance se você conjurou uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    const muro = tg.bf('Wall');
    expect(tg.pt(muro)).toEqual([0, 3]);
    expect(hasKw(tg.g, muro, 'defender') && hasKw(tg.g, muro, 'reach')).toBe(true);
  });

  it('ao atacar, pagando {R}{G}{W}{U}, a criatura alvo recebe +1/+0 por criatura sua e não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...QUATRO], []] });
    tg.yes('Pagar', true).choose('criatura alvo', ['Elvish Mystic']);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    const elfo = tg.bf('Elvish Mystic');
    // duas criaturas suas: 1/1 vira 3/1
    expect(tg.pt(elfo)).toEqual([3, 1]);
    expect(tg.state.effects.some((e) => e.affected?.includes(elfo) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBeBlocked'))).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
  });

  it('sem pagar, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...QUATRO], []] });
    tg.yes('Pagar', false);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });
});
