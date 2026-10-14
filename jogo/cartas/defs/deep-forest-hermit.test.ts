import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Deep Forest Hermit';
const lib = Array(8).fill('Forest');

describe(NOME, () => {
  it('entra com três marcadores de tempo e cria quatro Squirrels, que ficam 2/2', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters.time).toBe(3);
    const esq = tg.all('Squirrel');
    expect(esq.length).toBe(4);
    expect(tg.pt(esq[0])).toEqual([2, 2]);
  });

  it('CR 702.63a: esvanecer — perde um marcador por manutenção sua e é sacrificado quando sai o último', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { time: 2 } }], []], library: [lib, lib] });
    tg.passTo('main1', 1);
    expect(tg.state.objects[tg.bf(NOME)].counters.time).toBe(2);
    tg.passTo('main1', 0);
    // turno seguinte de Ana: 1 marcador
    expect(tg.state.objects[tg.bf(NOME)].counters.time).toBe(1);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
