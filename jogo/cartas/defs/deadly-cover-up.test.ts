import { describe, expect, it } from 'vitest';
import { copiableValues, copySpell, createTokens } from '../../motor/api.ts';
import { novoDiario } from '../../motor/diario.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const N = 'Deadly Cover-Up';
function reunir(tg: TestGame) {
  return tg.choose('custo adicional opcional', ['Pagar: reunir indícios 6'])
    .choose('Reunir indícios 6:', ['Zetalpa, Primal Dawn (valor de mana 8)']);
}

describe(N, () => {
  it('sem reunir indícios, destrói todas as criaturas e preserva artefatos, terrenos e indestrutível', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Indomitable Ancients', 'Sol Ring'], ['Elvish Mystic', 'Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.all('Swamp')).toHaveLength(5);
    expect(tg.names(1, 'exile')).toEqual([]);
  });
  it('pode exilar terrenos básicos e repõe somente as cartas exiladas da mão', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], ['Forest', 'Forest', 'Island']], graveyard: [['Zetalpa, Primal Dawn'], ['Forest', 'Forest', 'Sol Ring']], library: [[], ['Forest', 'Forest', 'Plains', 'Mountain', 'Swamp', 'Island']] });
    reunir(tg).choose('exile uma carta do cemitério', ['Forest'])
      .choose('na mão e no cemitério', ['Forest (cemitério)', 'Forest (mão)', 'Forest (mão)'])
      .choose('no grimório', ['Forest', 'Forest']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(Array(6).fill('Forest'));
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'hand')).toHaveLength(3);
    expect(tg.names(1, 'hand')).not.toContain('Forest');
    expect(tg.state.turnStats[1].cardsDrawn).toBe(2);
    expect(tg.names(1, 'library')).toHaveLength(2);
  });
  it('a carta inicial é escolhida depois da destruição, incluindo a criatura que acabou de morrer', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), ['Indomitable Ancients']], hand: [[N], ['Indomitable Ancients']], graveyard: [['Zetalpa, Primal Dawn'], []], library: [[], ['Forest', 'Plains']] });
    reunir(tg).choose('exile uma carta do cemitério', ['Indomitable Ancients'])
      .choose('na mão e no cemitério', ['Indomitable Ancients (mão)']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients', 'Indomitable Ancients']);
    expect(tg.names(1, 'hand')).toHaveLength(1);
    expect(tg.state.turnStats[1].cardsDrawn).toBe(1);
  });
  it('pode escolher zero cópias na busca, olha também as cartas que não têm o nome e ainda embaralha', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], ['Forest', 'Island']], graveyard: [['Zetalpa, Primal Dawn'], ['Forest']], library: [[], ['Forest', 'Plains', 'Sol Ring']] });
    let viuMao = false;
    let viuGrimorio = false;
    tg.g.diario = novoDiario();
    reunir(tg).choose('exile uma carta do cemitério', ['Forest']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('na mão e no cemitério')) return null;
      viuMao = d.items.some((i) => i.label === 'Island (mão)' && i.card?.def === 'Island' && i.disabled);
      return { kind: 'select', ids: [] };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('no grimório')) return null;
      viuGrimorio = d.items.some((i) => i.label === 'Sol Ring' && i.disabled);
      return { kind: 'select', ids: [] };
    });
    tg.cast(N).resolveAll();
    expect(viuMao && viuGrimorio).toBe(true);
    expect(tg.names(1, 'exile')).toEqual(['Forest']);
    expect(tg.names(1, 'hand')).toEqual(['Forest', 'Island']);
    expect(tg.state.turnStats[1].cardsDrawn).toBe(0);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'shuffle' && e.ev.player === 1)).toBe(true);
  });
  it('CR 701.59b: indícios insuficientes desabilitam o custo opcional', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Indomitable Ancients'], []], hand: [[N], []], graveyard: [['Sol Ring', 'Wall of Omens'], []] });
    let desabilitado = false;
    tg.script.push((d) => d.kind === 'select' && d.prompt.includes('custo adicional opcional')
      ? (desabilitado = !!d.items.find((i) => i.id === 'yes')?.disabled, { kind: 'select', ids: ['no'] }) : null);
    tg.cast(N).resolveAll();
    expect(desabilitado).toBe(true);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
  it('CR 601.2h: os indícios são exilados como custo, antes de o oponente receber prioridade', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), ['Island', 'Island']], hand: [[N], ['Counterspell']], graveyard: [['Zetalpa, Primal Dawn'], []] });
    reunir(tg).cast(N);
    expect(tg.names(0, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.pass().cast('Counterspell').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('CR 701.59c, 707.10: a cópia lembra que os indícios foram reunidos sem pagar novamente', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], []], graveyard: [['Zetalpa, Primal Dawn'], ['Forest', 'Plains']], library: [[], ['Island', 'Swamp']] });
    reunir(tg).cast(N);
    runEffect(tg, copySpell(tg.g, tg.state.zones.stack[0], 0));
    tg.choose('exile uma carta do cemitério', ['Forest']).resolve();
    expect(tg.names(1, 'exile')).toEqual(['Forest']);
    tg.choose('exile uma carta do cemitério', ['Plains']).resolve();
    expect(tg.names(1, 'exile')).toEqual(['Forest', 'Plains']);
    expect(tg.names(0, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
  });
  it('sem cartas nos cemitérios dos oponentes depois da destruição, não busca nem compra', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], ['Forest']], graveyard: [['Zetalpa, Primal Dawn'], []], library: [[], ['Island', 'Plains']] });
    tg.g.diario = novoDiario();
    reunir(tg).cast(N).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'search' || e.ev.type === 'shuffle')).toBe(false);
  });
  it('CR 701.23a: permite olhar a mão mesmo quando não contém nenhuma cópia elegível', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], ['Island']], graveyard: [['Zetalpa, Primal Dawn'], ['Forest']], library: [[], ['Plains']] });
    let viuMao = false;
    reunir(tg).choose('exile uma carta do cemitério', ['Forest']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('na mão e no cemitério')) return null;
      viuMao = d.player === 0 && d.min === 0 && d.max === 0 && d.items[0].card?.def === 'Island';
      return { kind: 'select', ids: [] };
    });
    tg.cast(N).resolveAll();
    expect(viuMao).toBe(true);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
  });
  it('CR 101.2: proibir buscar no grimório preserva as buscas na mão e no cemitério e o embaralhar', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), ['Stranglehold']], hand: [[N], ['Forest']], graveyard: [['Zetalpa, Primal Dawn'], ['Forest']], library: [[], ['Forest', 'Plains', 'Island']] });
    tg.g.diario = novoDiario();
    reunir(tg).choose('exile uma carta do cemitério', ['Forest']).choose('na mão e no cemitério', ['Forest (mão)']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Forest', 'Forest']);
    expect(tg.state.turnStats[1].cardsDrawn).toBe(1);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'search')).toBe(false);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'shuffle' && e.ev.player === 1)).toBe(true);
    // Uma Forest do grimório fica no grimório ou é a carta comprada, sem ter sido exilada.
    expect([...tg.names(1, 'library'), ...tg.names(1, 'hand')]).toContain('Forest');
  });
  it('CR 111.6–8: uma ficha que acabou de morrer não é uma carta para exilar nem causa busca', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), [{ name: 'Fish', token: true }]], hand: [[N], ['Forest']], graveyard: [['Zetalpa, Primal Dawn'], []], library: [[], ['Island', 'Plains']] });
    tg.g.diario = novoDiario();
    reunir(tg).cast(N).resolveAll();
    expect(tg.find('Fish')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'search' || e.ev.type === 'shuffle')).toBe(false);
  });
  it('CR 111.6: a busca no cemitério inclui só cartas, mesmo com uma ficha morta de mesmo nome', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), ['Indomitable Ancients']], hand: [[N], []], graveyard: [['Zetalpa, Primal Dawn'], []], library: [[], ['Island', 'Plains']] });
    runEffect(tg, createTokens(tg.g, 1, { copyOf: copiableValues(tg.g, tg.bf('Indomitable Ancients')) }, 1));
    reunir(tg).choose('exile uma carta do cemitério', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });
});
