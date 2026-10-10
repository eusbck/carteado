import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Sai, Master Thopterist";
describe(N, () => {
  it("gatilho resolve antes da mágica, mesmo quando a mágica é anulada", () => {

    const tg = setup({ battlefield: [[N, 'Island'], ['Island', 'Island']], hand: [['Aether Spellbomb'], ['Counterspell']] });
    tg.cast('Aether Spellbomb').pass(); tg.choose('mágica alvo', ['Aether Spellbomb']).cast('Counterspell').resolveAll();
    expect(tg.all('Thopter')).toHaveLength(1); expect(tg.find('Aether Spellbomb')).toBeNull();
    const id = tg.bf('Thopter'); expect(tg.pt(id)).toEqual([1, 1]); expect(chars(tg.g, id).colors).toEqual([]); expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });

  it("paga dois artefatos incluindo fichas e compra uma carta", () => {

    const tg = setup({ battlefield: [[N, 'Island', 'Island', { name: 'Thopter', token: true }, 'Ichor Wellspring'], []] });
    tg.choose('Sacrifique', ['Thopter', 'Ichor Wellspring']).activate(N).resolveAll();
    expect(tg.all('Thopter')).toHaveLength(0); expect(tg.find('Ichor Wellspring', 'graveyard')).not.toBeNull(); expect(tg.state.zones.hand[0]).toHaveLength(2);
  });
});
