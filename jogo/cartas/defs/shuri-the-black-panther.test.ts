import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shuri, the Black Panther';
const vibranium = (n: number) => Array.from({ length: n }, () => ({ name: 'Vibranium', token: true }));

describe(N, () => {
  it('vínculo com a vida; atacando com três artefatos, compra uma carta', () => {
    const tg = setup({ battlefield: [[N, ...vibranium(3)], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
  });

  it('com seis artefatos, as suas criaturas também recebem +2/+2; com dois, nada', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...vibranium(6)], []], library: [['Island', 'Island'], ['Island']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
    const sem = setup({ battlefield: [[N, ...vibranium(2)], []], library: [['Island'], ['Island']] });
    sem.attack([[N, 1]]).passTo('declareBlockers');
    expect(sem.names(0, 'hand')).toEqual([]);
  });
});