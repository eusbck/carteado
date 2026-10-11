import { describe, expect, it } from 'vitest';
import { attackCandidates, requiredTargets } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shiny Impetus';
const lib = Array(8).fill('Mountain');

describe(N, () => {
  it('a criatura encantada do oponente recebe +2/+2, fica goadada e, quando ataca, você cria um Treasure', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Elvish Mystic'], []], hand: [[N], [], []], library: [lib, lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('criatura', [elfo]).cast(N).resolveAll();
    expect(tg.pt(elfo)).toEqual([3, 3]);
    tg.passTo('main1', 1);
    // goadada por você: tem de atacar a Carla
    const alvos = attackCandidates(tg.g, 1).find((c) => c.obj === elfo)?.targets ?? [];
    expect(requiredTargets(tg.g, elfo, alvos).map((t) => t.id)).toEqual([2]);
    tg.attack([[elfo, 2]]);
    tg.passTo('main2', 1);
    expect(tg.life(2)).toBe(37);
    const [tesouro] = tg.all('Treasure');
    expect(tg.state.objects[tesouro].controller).toBe(0);
  });
});
