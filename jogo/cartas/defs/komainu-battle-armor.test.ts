import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Komainu Battle Armor';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('como criatura: 2/2 com ameaçar; o dano de combate dele goada as criaturas do jogador', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'menace')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].goadedBy.map((x) => x.player)).toEqual([0]);
  });

  it('anexado, a criatura equipada recebe +2/+2 e ameaçar, e o dano de combate dela goada as criaturas do jogador', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', ...Array(4).fill('Mountain')], ['Elvish Mystic']], library: [lib, lib] });
    tg.choose('outra criatura alvo', ['Silver Myr']).activate(N, 'anexe').resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([3, 3]);
    expect(hasKw(tg.g, myr, 'menace')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].goadedBy.map((x) => x.player)).toEqual([0]);
  });
});
