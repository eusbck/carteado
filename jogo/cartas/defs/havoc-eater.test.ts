import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Havoc Eater';

describe(NOME, () => {
  it('goada até uma criatura de cada oponente e recebe marcadores iguais à força total delas', () => {
    const tg = setup({ players: 3, battlefield: [Array(7).fill('Mountain'), ['Indomitable Ancients'], ['Zetalpa, Primal Dawn']], hand: [[NOME], [], []] });
    tg.choose('para cada oponente', ['Indomitable Ancients', 'Zetalpa, Primal Dawn']).cast(NOME).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].goadedBy.map((x) => x.player)).toEqual([0]);
    // 2 (Ancients) + 4 (Zetalpa)
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(6);
  });

  it('no máximo uma criatura por oponente', () => {
    const tg = setup({ battlefield: [Array(7).fill('Mountain'), ['Indomitable Ancients', 'Zetalpa, Primal Dawn']], hand: [[NOME], []] });
    expect(() => tg.choose('para cada oponente', ['Indomitable Ancients', 'Zetalpa, Primal Dawn']).cast(NOME).resolveAll()).toThrow();
  });
});
