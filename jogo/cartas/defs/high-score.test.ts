import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'High Score';

describe(N, () => {
  it('os marcadores +1/+1 postos numa criatura sua ganham mais um; com Corpsejack Menace, soma antes de dobrar', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Silver Myr') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters['+1/+1']).toBe(2);
    const dois = setup({ battlefield: [[N, 'Corpsejack Menace', 'Silver Myr'], []] });
    addCounters(dois.g, { kind: 'obj', id: dois.bf('Silver Myr') }, '+1/+1', 1, 0);
    expect(dois.state.objects[dois.bf('Silver Myr')].counters['+1/+1']).toBe(4);
  });

  it('na sua etapa final, compra uma carta se você controla uma criatura com a maior força do campo', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], ['Silver Myr']], library: [['Island', 'Island'], ['Island']] });
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    const nao = setup({ battlefield: [[N, 'Silver Myr'], ['Serra Angel']], library: [['Island', 'Island'], ['Island']] });
    nao.passTo('upkeep', 1);
    expect(nao.names(0, 'hand')).toEqual([]);
  });
});