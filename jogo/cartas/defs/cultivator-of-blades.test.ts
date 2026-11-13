import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cultivator of Blades';

describe(N, () => {
  it('X é a força na resolução; as outras atacantes recebem +X/+X', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }, 'Llanowar Elves'], []] });
    tg.yes('Cultivator', true).attack([[N, 1], ['Llanowar Elves', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Llanowar Elves'))).toEqual([4, 4]);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
  it('fabricar 2: dois marcadores ou dois Servos', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.yes('Fabricar', false).cast(N).resolve();
    tg.resolveAll();
    expect(tg.all('Servo').length).toBe(2);
  });
});
