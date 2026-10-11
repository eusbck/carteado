import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Royal Talon Fighter Jet';

describe(N, () => {
  it('entra com X marcadores +1/+1 e cria X Soldiers; atacando, cria de novo', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N], []] });
    tg.number('X', 3).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(3);
    expect(tg.all('Soldier')).toHaveLength(3);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.choose('Tripular:', ['Soldier']).choose('Tripular:', ['Soldier']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.all('Soldier')).toHaveLength(6);
  });
});