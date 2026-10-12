import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Love on the Battlefield';

describe(N, () => {
  it('atacando com exatamente duas criaturas: iniciativa, uma carta e um marcador +1/+1 em cada uma que causar dano de combate a um jogador', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', 'Indomitable Ancients', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.attack([['Serra Angel', 1], ['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
  });

  it('com uma ou três atacantes, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []], library: [['Island', 'Island'], ['Island']] });
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([4, 4]);
  });
});