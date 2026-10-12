import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Level Up';

describe(N, () => {
  it('põe um marcador ao entrar; quando a criatura encantada ataca, dobra os marcadores e compra com força 10 ou mais', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: 'Serra Angel', counters: { '+1/+1': 2 } }], []], hand: [[N], []], library: [['Island', 'Island'], ['Island']] });
    tg.choose('criatura', ['Serra Angel']).cast(N).resolveAll();
    const anjo = tg.bf('Serra Angel');
    expect(tg.pt(anjo)).toEqual([7, 7]);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.pt(anjo)).toEqual([10, 10]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});