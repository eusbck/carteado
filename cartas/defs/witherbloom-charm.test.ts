import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const campo = ['Swamp', 'Forest'];

describe('Witherbloom Charm', () => {
  it('modo 1: sacrifica um permanente e compra duas', () => {
    const tg = setup({ battlefield: [[...campo, 'Sol Ring'], []], hand: [['Witherbloom Charm'], []], library: [['Island', 'Island'], []] });
    tg.choose('modo', ['Você pode sacrificar um permanente. Se fizer isso, compre duas cartas']).choose('sacrificar um permanente', ['Sol Ring']);
    tg.cast('Witherbloom Charm').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
  });
  it('modo 1: sem sacrificar, não compra', () => {
    const tg = setup({ battlefield: [[...campo, 'Sol Ring'], []], hand: [['Witherbloom Charm'], []], library: [['Island', 'Island'], []] });
    tg.choose('modo', ['Você pode sacrificar um permanente. Se fizer isso, compre duas cartas']).choose('sacrificar um permanente', []);
    tg.cast('Witherbloom Charm').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('modo 2: ganha 5', () => {
    const tg = setup({ battlefield: [campo, []], hand: [['Witherbloom Charm'], []] });
    tg.choose('modo', ['Você ganha 5 de vida']).cast('Witherbloom Charm').resolve();
    expect(tg.life(0)).toBe(45);
  });
  it('modo 3: destrói permanente não terreno com valor de mana 2 ou menos', () => {
    const tg = setup({ battlefield: [campo, ['Wall of Omens', 'Zetalpa, Primal Dawn', 'Forest']], hand: [['Witherbloom Charm'], []] });
    let opcoes: string[] = [];
    tg.choose('modo', ['Destrua o permanente não terreno alvo com valor de mana 2 ou menos']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 2')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast('Witherbloom Charm').resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
