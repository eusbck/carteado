import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Cabbage Merchant';

describe(N, () => {
  it('mágica que não é de criatura de um oponente cria uma Food; de criatura, não', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest']], hand: [[], ['Sol Ring', 'Elvish Mystic']] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('a criatura que causa dano de combate a você faz sacrificar uma ficha Food, sem ganhar vida', () => {
    const tg = setup({ active: 1, battlefield: [[N, { name: 'Food', token: true }], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    tg.resolveAll();
    expect(tg.all('Food')).toHaveLength(0);
    expect(tg.life(0)).toBe(38);
  });

  it('vire duas Foods desviradas: uma mana de qualquer cor', () => {
    const food = { name: 'Food', token: true };
    const tg = setup({ battlefield: [[N, food, food], []] });
    activateMana(tg, N, 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
    expect(tg.all('Food').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
