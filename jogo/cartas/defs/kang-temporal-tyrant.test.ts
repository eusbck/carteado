import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Kang, Temporal Tyrant';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('na segunda carta comprada no turno, cada oponente perde 1 de vida e você ganha 1; na terceira, nada', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 4]);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
    runEffect(tg, draw(tg.g, 0, 2));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([41, 39, 39]);
  });

  it('ao atacar, trama', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Hex'], []], library: [lib, lib] });
    tg.choose('Descarte', ['Hex']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.life(1)).toBe(36);
  });
});
