import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sword of Truth and Justice';

describe(N, () => {
  it('põe o marcador e prolifera, escolhendo só o que quiser', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', { name: 'Llanowar Elves', counters: { '+1/+1': 1 } }], [{ name: 'Elvish Mystic', counters: { '+1/+1': 1 } }]] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 6]);
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'protection')).toBe(true);
    tg.choose('coloque um marcador', ['Serra Angel']).choose('Proliferar', ['Serra Angel', 'Llanowar Elves']);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(34);
    expect(tg.state.objects[tg.bf('Serra Angel')].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(1);
  });
});
