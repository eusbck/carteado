import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nirkana Revenant';

describe(N, () => {
  it('virar um Swamp para gerar mana dá um {B} a mais; outro terreno não', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Island'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    activateMana(tg, 'Swamp', 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B', 'B']);
    activateMana(tg, 'Island', 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'B', 'U']);
  });

  it('{B}: +1/+1 até o fim do turno, quantas vezes você pagar', () => {
    const tg = setup({ battlefield: [[N, 'Swamp'], []] });
    tg.activate(N, '{B}').resolveAll();
    tg.activate(N, '{B}').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });
});
