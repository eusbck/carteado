import { describe, expect, it } from 'vitest';
import { addCounters, gainLife } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Exemplar of Light';

describe(N, () => {
  it('cada evento de ganhar vida dá um marcador; a compra dispara só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    gainLife(tg.g, 0, 2, id);
    tg.refresh();
    tg.resolveAll();
    gainLife(tg.g, 0, 3, id);
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('marcadores postos por outro efeito seu também fazem comprar', () => {
    const tg = setup({ battlefield: [[N], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf(N) }, '+1/+1', 2, 0);
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('CR 122.6: entrando com o marcador +1/+1 de Giada, conta como pôr marcadores nela e compra uma carta', () => {
    const tg = setup({ battlefield: [['Giada, Font of Hope', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('comer uma Food (ganhar vida) põe um marcador e compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', { name: 'Food', token: true }], []] });
    tg.activate('Food').resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
