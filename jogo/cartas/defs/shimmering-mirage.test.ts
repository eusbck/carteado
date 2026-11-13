import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shimmering Mirage';

describe(N, () => {
  it('CR 305.7: o terreno alvo vira o tipo básico escolhido, perde as outras habilidades e ganha a de mana nova', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ["Agna Qel'a"]], hand: [[N], []], library: [['Opt'], ['Swamp']] });
    tg.choose('terreno alvo', ["Agna Qel'a"]).choose('escolha o tipo básico', ['Mountain']).cast(N).resolve();
    const a = tg.bf("Agna Qel'a");
    expect(chars(tg.g, a).subtypes).toEqual(['Mountain']);
    expect(chars(tg.g, a).abilities.map((x) => x.id)).toEqual(['basic:R']);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, a).subtypes).toEqual([]);
    expect(chars(tg.g, a).abilities.length).toBeGreaterThan(1);
  });
});
