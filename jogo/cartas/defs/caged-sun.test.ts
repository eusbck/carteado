import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Caged Sun';

describe(N, () => {
  it('escolhe uma cor; as suas criaturas dessa cor recebem +1/+1 e os seus terrenos dão uma mana a mais dessa cor, sem usar a pilha', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Island', 'Flayed One', 'Elvish Mystic'], ['Flayed One']] });
    tg.state.objects[tg.bf(N)].choices.cor = 'B';
    tg.refresh();
    expect(tg.pt(tg.bf('Flayed One', 0))).toEqual([5, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Flayed One', 1))).toEqual([4, 1]);
    activateMana(tg, 'Swamp', 'B');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B']);
    expect(tg.state.zones.stack).toHaveLength(0);
    activateMana(tg, 'Island', 'U');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'U']);
  });
});