import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Corpsejack Menace';

describe(N, () => {
  it('os marcadores +1/+1 postos numa criatura sua são dobrados; nas dos oponentes e em outros marcadores, não', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Elvish Mystic']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Silver Myr') }, '+1/+1', 2, 0);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Elvish Mystic') }, '+1/+1', 2, 0);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Silver Myr') }, 'charge', 1, 0);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters['+1/+1']).toBe(4);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters.charge).toBe(1);
  });

  it('a criatura que entraria com marcadores +1/+1 entra com o dobro', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Forest')], []], hand: [['Steelbane Hydra'], []] });
    tg.number('X', 3).cast('Steelbane Hydra').resolveAll();
    expect(tg.pt(tg.bf('Steelbane Hydra'))).toEqual([6, 6]);
  });

  it('dois Corpsejack Menace quadruplicam os marcadores', () => {
    const tg = setup({ battlefield: [[N, N, 'Silver Myr'], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Silver Myr') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters['+1/+1']).toBe(4);
  });
});