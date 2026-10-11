import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "M'Baku, Jabari Chieftain";

describe(N, () => {
  it('na sua etapa final, sem monarca, o oponente alvo vira o monarca; atacando o monarca, as criaturas recebem +1/+1 e atropelar', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
    tg.passTo('upkeep', 1);
    expect(tg.state.monarch).toBe(1);
    tg.passTo('main1', 0);
    tg.attack([[N, 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(N))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'trample')).toBe(true);
  });

  it('atacando um oponente que não é o monarca, nada', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
  });
});