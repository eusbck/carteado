import { describe, expect, it } from 'vitest';
import { chars, removeCounters } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Aquitect's Will";

describe(N, () => {
  it('o terreno alvo vira Island além dos outros tipos e produz {U} enquanto tiver o marcador de inundação', () => {
    const tg = setup({ battlefield: [['Island'], ['Forest']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('terreno alvo', ['Forest']).cast(N).resolve();
    const f = tg.bf('Forest');
    expect(tg.state.objects[f].counters.flood).toBe(1);
    expect(chars(tg.g, f).subtypes).toEqual(['Forest', 'Island']);
    expect(chars(tg.g, f).abilities.map((a) => a.id)).toContain('basic:U');
    // sem Merfolk, não compra
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.run(((function* () { removeCounters(tg.g, { kind: 'obj', id: f }, 'flood', 1); })()));
    expect(chars(tg.g, f).subtypes).toEqual(['Forest']);
  });
  it('controlando um Merfolk, compra uma carta (o polimorfo é Merfolk)', () => {
    const tg = setup({ battlefield: [['Island', 'Orvar, the All-Form'], []], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('terreno alvo', ['Island']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
});
