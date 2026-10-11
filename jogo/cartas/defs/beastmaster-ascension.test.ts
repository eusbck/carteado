import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Beastmaster Ascension';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('um marcador de missão para cada criatura sua que ataca; com sete, as suas criaturas recebem +5/+5', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr'], ['Elvish Mystic']], library: [lib, lib] });
    const id = tg.bf(N);
    tg.state.objects[id].counters.quest = 5;
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    tg.yes('Beastmaster Ascension', true);
    tg.attack([['Elvish Mystic', 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[id].counters.quest).toBe(7);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([6, 6]);
    expect(tg.pt(tg.bf('Elvish Mystic', 1))).toEqual([1, 1]);
  });

  it('é opcional', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.yes('Beastmaster Ascension', false);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf(N)].counters.quest ?? 0).toBe(0);
  });
});
