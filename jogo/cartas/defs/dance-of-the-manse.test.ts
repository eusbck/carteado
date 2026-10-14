import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Dance of the Manse';
const terrenos = (n: number) => ['Plains', 'Island', ...Array(n).fill('Plains')];

describe(N, () => {
  it('devolve até X artefatos e encantamentos que não são Aura, com valor de mana X ou menos', () => {
    const tg = fixture({ battlefield: [terrenos(3), []], hand: [[N], []], graveyard: [['Sol Ring', 'Colossal Majesty', "Kenrith's Transformation", 'Gigantosaurus', 'Tangleweave Armor'], []] });
    let oferecidas: string[] = [];
    tg.number('valor de X', 3);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('valor de mana X ou menos') ? (oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: d.items.filter((i) => ['Sol Ring', 'Colossal Majesty'].includes(i.label)).map((i) => i.id) }) : null));
    tg.cast(N).resolveAll();
    expect(oferecidas.sort()).toEqual(['Colossal Majesty', 'Sol Ring']);
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Colossal Majesty')).not.toBeNull();
    expect(chars(tg.g, tg.bf('Sol Ring')).types).toEqual(['Artifact']);
  });

  it('com X 6 ou mais, entram como criaturas 4/4 e assim ficam', () => {
    const tg = fixture({ battlefield: [terrenos(6), []], hand: [[N], []], graveyard: [['Sol Ring', 'Colossal Majesty'], []] });
    tg.number('valor de X', 6);
    tg.choose('valor de mana X ou menos', ['Sol Ring', 'Colossal Majesty']);
    tg.cast(N).resolveAll();
    for (const n of ['Sol Ring', 'Colossal Majesty']) {
      expect(chars(tg.g, tg.bf(n)).types).toContain('Creature');
      expect(tg.pt(tg.bf(n))).toEqual([4, 4]);
    }
    tg.passTo('main1', 1);
    expect(tg.pt(tg.bf('Sol Ring'))).toEqual([4, 4]);
    expect(tg.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id === 'rule:spellGains'))).toBe(false);
  });
});
