import { describe, expect, it } from 'vitest';
import { loseLife } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Namor, Atlantean King';

describe(N, () => {
  it('voar; cria um Merfolk 1/1 azul quando você conjura uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Forest'], []], hand: [['Sol Ring', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Merfolk')).toHaveLength(1);
    expect(tg.pt(tg.all('Merfolk')[0])).toEqual([1, 1]);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Merfolk')).toHaveLength(1);
  });

  it('atacando um jogador com mais vida que você, as outras criaturas suas atacando esse jogador recebem +2/+0', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Indomitable Ancients', 'Elvish Mystic'], [], []] });
    loseLife(tg.g, 0, 5, null);
    tg.refresh();
    // Namor e Ancients em Bruno; Mystic em Carla (não recebe)
    tg.attack([[N, 1], ['Indomitable Ancients', 1], ['Elvish Mystic', 2]]).passTo('main2', 0);
    expect([tg.life(1), tg.life(2)]).toEqual([40 - 2 - 4, 39]);
  });

  it('atacando um jogador com a mesma vida ou menos, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []] });
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });
});
