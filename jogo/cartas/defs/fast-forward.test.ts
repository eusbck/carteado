import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fast Forward';

describe(N, () => {
  it('custa {1} a menos para cada oponente que você atacou neste turno; incita todas as criaturas dos oponentes', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), 'Serra Angel'], ['Wall of Omens']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.canCast(N)).toBe(true);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Serra Angel')].goadedBy).toEqual([]);
  });
});