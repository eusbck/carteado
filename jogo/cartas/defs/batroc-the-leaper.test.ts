import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Batroc the Leaper';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('CR 702.33c: reforçado duas vezes, entra com dois marcadores e causa dano igual à força a até dois alvos', () => {
    // {1}{R} + {2} + {2} = seis manas; 2/2 com dois marcadores = 4 de dano
    const tg = fixture({ players: 3, battlefield: [montanhas(6), ['Indomitable Ancients'], []], hand: [[N], [], []] });
    tg.number('quantas vezes', 2).choose('até X alvos', ['Indomitable Ancients', 'Carla']);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect([tg.life(1), tg.life(2)]).toEqual([40, 36]);
  });

  it('pode escolher menos alvos do que X', () => {
    const tg = fixture({ battlefield: [montanhas(6), []], hand: [[N], []] });
    tg.number('quantas vezes', 2).choose('até X alvos', ['Bruno']);
    tg.cast(N).resolveAll();
    expect(tg.life(1)).toBe(36);
  });

  it('sem reforçar, entra 2/2 sem marcadores e não causa dano', () => {
    const tg = fixture({ battlefield: [montanhas(2), []], hand: [[N], []] });
    tg.number('quantas vezes', 0).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.life(1)).toBe(40);
    // posto no campo sem ser conjurado também não foi reforçado
    const outro = fixture({ battlefield: [[], []] });
    const id = enterCard(outro, N, 0)!;
    outro.resolveAll();
    expect(outro.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
    expect(outro.life(1)).toBe(40);
  });
});
