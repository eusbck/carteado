import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Human Torch';
const QUATRO = ['Mountain', 'Forest', 'Plains', 'Island'];

describe(N, () => {
  it('no início do combate, ganha voar, golpe duplo e ímpeto se você conjurou uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'double strike') && hasKw(tg.g, id, 'haste')).toBe(true);
  });

  it('pagando {R}{G}{W}{U} ao atacar, o dano de combate a um oponente é repetido em cada outro oponente', () => {
    const tg = setup({ players: 3, battlefield: [[N, ...QUATRO], [], []] });
    tg.yes('Pagar', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect([tg.life(1), tg.life(2)]).toEqual([37, 37]);
  });

  it('sem pagar, só o jogador atacado toma o dano', () => {
    const tg = setup({ players: 3, battlefield: [[N, ...QUATRO], [], []] });
    tg.yes('Pagar', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect([tg.life(1), tg.life(2)]).toEqual([37, 40]);
  });
});
