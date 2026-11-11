import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Astral Cornucopia';

describe(N, () => {
  it('com X = 2 custa {6} e entra com dois marcadores; a mana é de uma cor só, uma por marcador', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains')], []], hand: [[N], []] });
    tg.number('X', 2).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters.charge).toBe(2);
    expect(tg.all('Plains').every((p) => tg.state.objects[p].tapped)).toBe(true);
    const alts = manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''));
    expect(alts).toEqual(expect.arrayContaining(['WW', 'UU', 'BB', 'RR', 'GG']));
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type).join('')).toBe('GG');
  });
});
