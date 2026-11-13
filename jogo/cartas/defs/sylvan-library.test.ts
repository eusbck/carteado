import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sylvan Library';
const LIB = ['Island', 'Swamp', 'Plains', 'Mountain'];

describe(N, () => {
  it('a compra normal vem antes; escolhendo comprar, paga 4 de vida ou devolve ao topo cada uma de duas cartas compradas', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[N], []], hand: [['Forest'], []], library: [LIB, []] });
    tg.yes('comprar duas cartas a mais', true);
    // escolhe Island (compra normal) e Plains; paga por Island, devolve Plains
    tg.choose('compradas neste turno', ['Island', 'Plains']);
    tg.yes('ficar com Island', true).yes('ficar com Plains', false);
    tg.passTo('main1');
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Island', 'Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Mountain']);
    expect(tg.life(0)).toBe(36);
  });

  it('a Forest que já estava na mão não pode ser escolhida', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[N], []], hand: [['Forest'], []], library: [LIB, []] });
    let ofereceu: string[] = [];
    tg.yes('comprar duas cartas a mais', true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !/compradas neste turno/.test(d.prompt)) return null;
      ofereceu = d.items.map((i) => i.label);
      return { kind: 'select', ids: d.items.slice(0, 2).map((i) => i.id) };
    });
    tg.passTo('main1');
    expect(ofereceu.sort()).toEqual(['Island', 'Plains', 'Swamp']);
  });

  it('sem 4 de vida, a carta escolhida volta para o topo', () => {
    const tg = setup({ step: 'upkeep', life: 3, battlefield: [[N], []], library: [LIB, []] });
    tg.yes('comprar duas cartas a mais', true).choose('compradas neste turno', ['Swamp', 'Plains']);
    tg.passTo('main1');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'library').slice(2)).toEqual(['Mountain']);
    expect(tg.names(0, 'library').slice(0, 2).sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.life(0)).toBe(3);
  });

  it('pode não comprar', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[N], []], library: [LIB, []] });
    tg.yes('comprar duas cartas a mais', false).passTo('main1');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(40);
  });
});
