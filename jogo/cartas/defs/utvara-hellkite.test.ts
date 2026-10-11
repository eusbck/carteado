import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const U = 'Utvara Hellkite';
const fichas = (tg: TestGame) => tg.all('Dragon').filter((id) => tg.state.objects[id].isToken);

describe(U, () => {
  it('voar; cada Dragon seu que ataca cria uma ficha Dragon 6/6 com voar', () => {
    const tg = setup({ battlefield: [[U, 'Rapacious Dragon', 'Wall of Omens'], []] });
    expect(hasKw(tg.g, tg.bf(U), 'flying')).toBe(true);
    tg.attack([[U, 1], ['Rapacious Dragon', 1]]).passTo('declareBlockers');
    expect(fichas(tg)).toHaveLength(2);
    expect(tg.pt(fichas(tg)[0])).toEqual([6, 6]);
    expect(hasKw(tg.g, fichas(tg)[0], 'flying')).toBe(true);
  });
  it('criatura que não é Dragon atacando não dispara', () => {
    const tg = setup({ battlefield: [[U, 'Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(fichas(tg)).toHaveLength(0);
  });
  it('Dragon de oponente atacando não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[U], ['Rapacious Dragon']] });
    tg.attack([['Rapacious Dragon', 0]]).passTo('declareBlockers');
    expect(fichas(tg)).toHaveLength(0);
  });
});
