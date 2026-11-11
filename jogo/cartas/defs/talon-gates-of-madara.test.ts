import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Talon Gates of Madara';

describe(N, () => {
  it('{4}: da mão para o campo, sem contar como jogar terreno; e a criatura alvo sai de fase', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [[N], []] });
    tg.pass().choose('até uma criatura alvo', ['Elvish Mystic']).activate(N, '{4}').resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].phasedOut).toBe(true);
    expect(tg.state.turn.landsPlayed).toBe(0);
  });
  it('a criatura sai de fase e volta na etapa de desvirar do controlador', () => {
    const tg = setup({ battlefield: [[], ['Elvish Mystic']], hand: [[N], []], library: [['Opt'], ['Forest', 'Forest']] });
    tg.choose('até uma criatura alvo', ['Elvish Mystic']).play(N).resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].phasedOut).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].phasedOut).toBe(false);
  });
  it('{T}: {C}; {1}, {T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    const alts = manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N)).map((o) => o.alt.join('')).sort();
    expect(alts).toEqual(['B', 'C', 'G', 'R', 'U', 'W']);
  });
});
