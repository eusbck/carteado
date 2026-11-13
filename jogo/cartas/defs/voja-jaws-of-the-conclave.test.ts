import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Voja, Jaws of the Conclave';

describe(N, () => {
  it('ao atacar: X marcadores em cada criatura sua (X = Elfos) e compra uma carta por Lobo', () => {
    const tg = setup({ battlefield: [[N, 'Llanowar Elves', 'Elvish Mystic'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(2);
    // Voja é Lobo: uma carta
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
