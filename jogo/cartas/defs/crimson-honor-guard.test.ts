import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Crimson Honor Guard';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('causa 4 de dano na etapa final de cada jogador que não controla um comandante, inclusive você', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 5]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    tg.passTo('main1', 1);
    expect(tg.life(0)).toBe(36);
    // o oponente controla um comandante: não toma o dano
    const elfo = tg.bf('Elvish Mystic');
    tg.state.cards[tg.state.objects[elfo].card!].isCommander = true;
    tg.refresh();
    tg.passTo('main1', 0);
    expect(tg.life(1)).toBe(40);
  });
});
