import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cold-Eyed Selkie';

describe(N, () => {
  it('CR 702.14c: não pode ser bloqueada se o jogador defensor controla uma Island', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Island']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(tg.bf(N)))).toBe(false);
  });
  it('sem Island do defensor, pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Indomitable Ancients', 'Swamp']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(tg.bf(N)))).toBe(true);
  });
  it('com dano de combate, pode comprar essa quantidade de cartas', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []] });
    tg.yes('comprar', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });
});
