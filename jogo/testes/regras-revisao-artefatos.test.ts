// Regressões dos problemas que a revisão achou no motor de artefatos (custos, improvisar, camadas, gatilhos de estado).
import { describe, expect, it } from 'vitest';
import { addEffect, chars, controllerOf, defineToken, destroy, gainLife, isType, triggered } from '../motor/api.ts';
import { fixture, runEffect } from './artefatos.ts';

// gatilho de estado que olha o resto do campo: "quando você não controlar outros artefatos, ganhe 1 de vida"
const sozinho = 'Teste estado sem outros artefatos';
defineToken({ id: sozinho, name: sozinho, types: ['Artifact'], subtypes: [], colors: [], power: null, toughness: null, abilities: [triggered({ kind: 'state', check: (c) => !c.g.state.zones.battlefield.some((id) => id !== c.source && controllerOf(c.g, id) === c.you && isType(c.g, id, 'Artifact')) }, function* (c) {
  gainLife(c.g, c.you, 1, c.source);
}, { text: 'Quando você não controlar outros artefatos, ganhe 1 de vida.' })] });

describe('CDA de carta fora do campo durante as camadas (CR 604.3, 613.1, 613.4a)', () => {
  it('Duplicant e o Master of Etherium exilado contam o artefato criado por efeito de tipo (camada 4)', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Master of Etherium', 'Silver Myr', 'Elvish Mystic']], hand: [['Duplicant'], []] });
    tg.choose('criatura não ficha', ['Master of Etherium']).yes('Duplicant:').cast('Duplicant').resolveAll();
    const dup = tg.bf('Duplicant');
    expect(tg.pt(dup)).toEqual([1, 1]);
    const elf = tg.bf('Elvish Mystic');
    addEffect(tg.g, { source: elf, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [elf], mods: [{ k: 'addTypes', types: ['Artifact'] }] });
    tg.g.bump(); tg.refresh();
    expect(tg.pt(dup)).toEqual([2, 2]);
    const master = tg.find('Master of Etherium', 'exile')!;
    expect([chars(tg.g, master).power, chars(tg.g, master).toughness]).toEqual([2, 2]);
    // a leitura depois da passada e um novo cálculo concordam (nada ficou em cache com o campo pela metade)
    tg.g.derived = null;
    expect([chars(tg.g, master).power, tg.pt(dup)]).toEqual([2, [2, 2]]);
  });
  it('o Master exilado deixa de contar o artefato do dono que outro jogador passou a controlar (camada 2)', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Master of Etherium', 'Silver Myr', 'Sol Ring']], hand: [['Duplicant'], []] });
    tg.choose('criatura não ficha', ['Master of Etherium']).yes('Duplicant:').cast('Duplicant').resolveAll();
    const dup = tg.bf('Duplicant');
    expect(tg.pt(dup)).toEqual([2, 2]);
    const myr = tg.bf('Silver Myr');
    addEffect(tg.g, { source: dup, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [myr], mods: [{ k: 'control', player: 0 }] });
    tg.g.bump(); tg.refresh();
    expect(tg.pt(dup)).toEqual([1, 1]);
  });
});

describe('improvisar no pagamento automático: fontes de mana primeiro (CR 702.126a)', () => {
  const thopters = (n: number) => Array.from({ length: n }, () => ({ name: 'Thopter', token: true }));
  const virados = (tg: ReturnType<typeof fixture>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).map((id) => tg.state.objects[id].def).sort();
  it('Kappa Cannoneer com seis Islands e cinco Thopters vira as seis Islands e nenhum Thopter', () => {
    const tg = fixture({ battlefield: [[...thopters(5), ...Array(6).fill('Island')], []], hand: [['Kappa Cannoneer'], []] });
    tg.cast('Kappa Cannoneer');
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toContain('Kappa Cannoneer');
    expect(virados(tg)).toEqual(Array(6).fill('Island'));
  });
  it('só improvisa o que falta, preferindo o artefato que não é criatura e sem habilidade de mana', () => {
    const tg = fixture({ battlefield: [[...thopters(2), 'Swiftfoot Boots', 'Sol Ring', 'Island', 'Island', 'Island'], []], hand: [['Kappa Cannoneer'], []] });
    tg.cast('Kappa Cannoneer');
    // três Islands e o Sol Ring dão cinco manas; falta uma, paga virando as Swiftfoot Boots
    expect(virados(tg)).toEqual(['Island', 'Island', 'Island', 'Sol Ring', 'Swiftfoot Boots']);
    // com uma Mind Stone a mais, as fontes de mana pagam tudo e nada é improvisado
    const tg2 = fixture({ battlefield: [[...thopters(2), 'Swiftfoot Boots', 'Sol Ring', 'Mind Stone', 'Island', 'Island', 'Island'], []], hand: [['Kappa Cannoneer'], []] });
    tg2.cast('Kappa Cannoneer');
    expect(virados(tg2)).toEqual(['Island', 'Island', 'Island', 'Mind Stone', 'Sol Ring']);
  });
  it('entre criaturas, vira primeiro a que está com enjoo de invocação', () => {
    const tg = fixture({ battlefield: [[{ name: 'Thopter', token: true }, 'Island', 'Island', 'Island', 'Island', 'Island', { name: 'Thopter', token: true, ready: false }], []], hand: [['Kappa Cannoneer'], []] });
    const prontos = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Thopter');
    tg.cast('Kappa Cannoneer');
    const [velho, novo] = prontos;
    expect(tg.state.objects[novo].tapped).toBe(true);
    expect(tg.state.objects[velho].tapped).toBe(false);
  });
});

describe('improvisar à mão: virar um artefato não fecha a janela de mana (CR 601.2g-h, 702.126a)', () => {
  it('Kappa Cannoneer: improvisa com dois Thopters clicando neles e paga o resto com as Islands, em qualquer ordem', () => {
    const tg = fixture({ battlefield: [[{ name: 'Thopter', token: true }, { name: 'Thopter', token: true }, 'Island', 'Island', 'Island', 'Island'], []], hand: [['Kappa Cannoneer'], []] });
    const [t1, t2] = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Thopter');
    const ilhas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island');
    // a ordem dos cliques: Island, Thopter, Island, Island, Thopter, Island, confirmar
    const cliques: number[] = [ilhas[0], t1, ilhas[1], ilhas[2], t2, ilhas[3]];
    const custos: string[] = [];
    // cada resposta roteirizada vale uma vez: uma por clique e a confirmação
    for (let i = 0; i <= cliques.length; i++) tg.script.push((d) => {
      if (d.kind !== 'payment') return null;
      custos.push(d.cost);
      const obj = cliques.shift();
      if (obj === undefined) return { kind: 'payment', pay: true };
      const fonte = d.sources.find((s) => s.obj === obj);
      if (!fonte) throw new Error(`fonte recusada: ${tg.state.objects[obj].def} (custo ${d.cost})`);
      return { kind: 'payment', activate: { source: fonte.id } };
    });
    tg.cast('Kappa Cannoneer');
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toContain('Kappa Cannoneer');
    expect(custos).toEqual(['{5}{U}', '{5}{U}', '{4}{U}', '{4}{U}', '{4}{U}', '{3}{U}', '{3}{U}']);
    expect([t1, t2, ...ilhas].every((id) => tg.state.objects[id].tapped)).toBe(true);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
  });
});

describe('gatilho de estado de objeto que saiu do campo (CR 603.8, 113.6)', () => {
  it('destruído junto com os outros artefatos, não dispara pela última informação conhecida', () => {
    const tg = fixture({ battlefield: [[{ name: sozinho, token: true }, 'Sol Ring'], []] });
    expect(tg.state.zones.stack).toHaveLength(0);
    runEffect(tg, destroy(tg.g, [tg.bf(sozinho), tg.bf('Sol Ring')]));
    expect(tg.state.pendingTriggers).toHaveLength(0);
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
  });
  it('no campo, dispara quando o estado passa a valer (o mesmo efeito, sem o objeto sair)', () => {
    const tg = fixture({ battlefield: [[{ name: sozinho, token: true }, 'Sol Ring'], []] });
    runEffect(tg, destroy(tg.g, [tg.bf('Sol Ring')]));
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.life(0)).toBe(41);
  });
  it('Mazemind Tome destruído com quatro marcadores não põe gatilho na pilha', () => {
    const tg = fixture({ battlefield: [[{ name: 'Mazemind Tome', counters: { page: 3 } }], []], hand: [[], []] });
    const tome = tg.bf('Mazemind Tome');
    tg.state.objects[tome].counters.page = 4; tg.g.bump(); tg.refresh();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.life(0)).toBe(44);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.state.pendingTriggers).toHaveLength(0);
  });
});
