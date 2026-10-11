import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Thing';
const QUATRO = ['Mountain', 'Forest', 'Plains', 'Island'];

describe(N, () => {
  it('atropelar; no início do combate, ganha quatro marcadores +1/+1 se você conjurou uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(tg.pt(id)).toEqual([9, 9]);
  });

  it('pagando {R}{G}{W}{U} ao atacar, dobra cada tipo de marcador dos permanentes alvo que você controla', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...QUATRO], []] });
    const id = tg.bf(N);
    const elfo = tg.bf('Elvish Mystic');
    addCounters(tg.g, { kind: 'obj', id }, '+1/+1', 2, 0);
    addCounters(tg.g, { kind: 'obj', id: elfo }, '+1/+1', 3, 0);
    addCounters(tg.g, { kind: 'obj', id: elfo }, 'charge', 1, 0);
    tg.refresh();
    tg.yes('Pagar', true).choose('permanentes alvo', [N, 'Elvish Mystic']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[id].counters['+1/+1']).toBe(4);
    expect(tg.state.objects[elfo].counters).toMatchObject({ '+1/+1': 6, charge: 2 });
  });
});
