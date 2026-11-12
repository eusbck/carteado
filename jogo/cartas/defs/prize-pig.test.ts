import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Prize Pig';

describe(N, () => {
  it('com três ou mais marcadores de fita, remove todos e desvira o porco, mesmo já desvirado', () => {
    const tg = setup({ battlefield: [[N], []] });
    const porco = tg.bf(N);
    activateMana(tg, N, 'G');
    expect(tg.state.objects[porco].tapped).toBe(true);
    gainLife(tg.g, 0, 2, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[porco].counters.ribbon).toBe(2);
    expect(tg.state.objects[porco].tapped).toBe(true);
    gainLife(tg.g, 0, 1, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[porco].counters.ribbon ?? 0).toBe(0);
    expect(tg.state.objects[porco].tapped).toBe(false);
    // já desvirado: ganha 5 de uma vez e os marcadores somem igual
    gainLife(tg.g, 0, 5, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[porco].counters.ribbon ?? 0).toBe(0);
  });
});
