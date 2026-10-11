import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Everflowing Chalice';

describe(N, () => {
  it('CR 702.33c: com o multikicker pago duas vezes, entra com dois marcadores de carga e gera {C}{C}', () => {
    const tg = fixture({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.number('quantas vezes', 2).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters.charge).toBe(2);
    expect(tg.all('Island').every((i) => tg.state.objects[i].tapped)).toBe(true);
    activateMana(tg, N, 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type).join('')).toBe('CC');
  });

  it('conjurado sem reforçar, custa {0}, entra sem marcadores e não gera mana', () => {
    const tg = fixture({ battlefield: [[], []], hand: [[N], []] });
    tg.number('quantas vezes', 0).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters.charge ?? 0).toBe(0);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(false);
  });

  it('posto no campo sem ser conjurado, entra sem marcadores e não gera mana', () => {
    const tg = fixture({ battlefield: [['Island', 'Island'], []] });
    const id = enterCard(tg, N, 0)!;
    expect(tg.state.objects[id].counters.charge ?? 0).toBe(0);
    expect(manaOptions(tg.g, 0).some((o) => o.obj === id)).toBe(false);
  });
});
