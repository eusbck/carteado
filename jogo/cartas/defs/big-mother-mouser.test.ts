import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/actions.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Big Mother Mouser';

describe(N, () => {
  it('entra com dois marcadores; atacando dobra; morrendo cria um Robot 1/1 para cada marcador +1/+1', () => {
    const novo = setup({ battlefield: [Array(4).fill('Forest'), []], hand: [[N], []] });
    novo.cast(N).resolveAll();
    expect(novo.pt(novo.bf(N))).toEqual([2, 2]);
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.all('Robot')).toHaveLength(4);
    expect(tg.pt(tg.all('Robot')[0])).toEqual([1, 1]);
  });

  it('morrendo por marcadores -1/-1, contam os marcadores +1/+1 que ela tinha', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 3 } }], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf(N) }, '-1/-1', 4, 1);
    tg.refresh();
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.all('Robot')).toHaveLength(3);
  });
});