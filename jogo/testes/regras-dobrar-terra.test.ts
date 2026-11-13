// lote4-c: dobrar a terra (earthbend, CR 701.66), em motor/terra.ts.
import { describe, expect, it } from 'vitest';
import { exile, returnToHand, untilEndOfTurn } from '../motor/api.ts';
import { chars, hasKw } from '../motor/chars.ts';
import { earthbend } from '../motor/terra.ts';
import type { Ctx } from '../motor/defs.ts';
import { runEffect } from './artefatos.ts';
import { setup, type TestGame } from './harness.ts';

const ctx = (tg: TestGame): Ctx => ({ g: tg.g, you: 0, source: tg.bf('Indomitable Ancients') } as unknown as Ctx);

describe('Dobrar a terra (CR 701.66)', () => {
  it('CR 701.66a: o terreno vira criatura terreno 0/0 com ímpeto e recebe N marcadores +1/+1', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Forest'], []] });
    const f = tg.bf('Forest');
    runEffect(tg, earthbend(ctx(tg), f, 3));
    expect(chars(tg.g, f).types).toEqual(expect.arrayContaining(['Land', 'Creature']));
    expect(tg.pt(f)).toEqual([3, 3]);
    expect(hasKw(tg.g, f, 'haste')).toBe(true);
    expect(chars(tg.g, f).colors).toEqual([]);
  });
  it('CR 701.66a: num terreno que já é criatura, a base passa a 0/0', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Forest'], []] });
    const f = tg.bf('Forest');
    untilEndOfTurn(ctx(tg), [f], [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 3, t: 3 }]);
    tg.refresh();
    runEffect(tg, earthbend(ctx(tg), f, 1));
    expect(tg.pt(f)).toEqual([1, 1]);
  });
  it('CR 701.66a: exilado, volta ao campo virado sob o seu controle', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Forest'], []] });
    runEffect(tg, earthbend(ctx(tg), tg.bf('Forest'), 1));
    runEffect(tg, exile(tg.g, [tg.bf('Forest')]));
    tg.resolveAll();
    const f = tg.bf('Forest');
    expect(tg.state.objects[f].tapped).toBe(true);
    expect(tg.state.objects[f].controller).toBe(0);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
  it('CR 701.66a: devolvido à mão, não volta', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Forest'], []] });
    runEffect(tg, earthbend(ctx(tg), tg.bf('Forest'), 1));
    runEffect(tg, returnToHand(tg.g, [tg.bf('Forest')]));
    tg.resolveAll();
    expect(tg.find('Forest')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
