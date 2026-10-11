import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vibranium Mining Mech';

describe(N, () => {
  it('entrando, cria um Vibranium virado; tripulado, é uma criatura 6/6 com atropelar que cria outro ao atacar', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Indomitable Ancients'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(isCreature(tg.g, id)).toBe(false);
    expect(tg.all('Vibranium')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Vibranium')].tapped).toBe(true);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    tg.activate(N, '+1/+0').resolveAll();
    expect(tg.pt(id)).toEqual([7, 6]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.all('Vibranium')).toHaveLength(2);
  });
});