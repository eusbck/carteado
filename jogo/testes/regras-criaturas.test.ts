// Regras de mecânicas de criaturas, permanentes, combate e fichas (lote 2, agente D; motor/criaturas.ts). As fichas de
// teste ficam só neste arquivo; as cartas reais que usam cada mecânica têm os próprios testes em cartas/defs.
import { describe, expect, it } from 'vitest';
import {
  addCombatPhaseAfterCurrent, amass, attachedGets, bloodthirst, chapter, chars, clash, connive, controlledBy, createObject,
  createTokens, defineToken, destroy, dethrone, entersAsCopy, evolve, hasKw, hideaway, isCreature, isMonstrous, isRingBearer,
  isType, keyword, keywords, linkedExiled, melee, mobilize, monstrosity, persist, readAhead, reconfigure, regenerate,
  ringTempts, ringTemptations, staticAbility, typecycling, becomeCopy, changeling, gainLife, controllerOf, preventRegeneration, searchLibrary,
} from '../motor/api.ts';
import { buildView } from '../motor/view.ts';
import { fixture, runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

const T = (id: string, p: number, t: number, abilities: Parameters<typeof defineToken>[0]['abilities'] = [], extra: Partial<Parameters<typeof defineToken>[0]> = {}) =>
  defineToken({ id, name: id, types: ['Creature'], subtypes: [], colors: [], power: p, toughness: t, abilities, ...extra });

T('T 2/2', 2, 2);
T('T 3/3', 3, 3);
T('T 1/4', 1, 4);
T('T 5/5', 5, 5);
T('T clone', 0, 0, [entersAsCopy({
  label: 'T clone', what: 'uma criatura ou planeswalker que você controla', text: 'clone de teste',
  candidates: (c, ev) => controlledBy(c.g, ev.controller, (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')),
  except: () => ({ legendary: false }),
  then: (_c, ev, copia) => {
    if (copia.types.includes('Creature')) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
    if (copia.types.includes('Planeswalker')) ev.counters.loyalty = (ev.counters.loyalty ?? 0) + 1;
  },
})]);
T('T persistir', 2, 2, [persist()]);
T('T corpo a corpo', 1, 1, [melee()]);
T('T destronar', 1, 1, [dethrone()]);
T('T mobilizar', 1, 1, [mobilize(2)]);
T('T sede', 1, 1, [bloodthirst(2)]);
T('T monstro', 2, 2, [monstrosity('{1}', 2)]);
T('T evoluir', 2, 2, [evolve()]);
T('T infectar', 2, 2, keywords('infect'));
T('T polimorfo', 1, 1, [changeling()]);
T('T ciclagem', 1, 1, [typecycling('Swamp', '{1}')]);
T('T lenda', 1, 1, [], { supertypes: ['Legendary'] });
T('T sem lenda', 1, 1, [staticAbility({ rules: { legendRuleExempt: (c, p) => p === c.you }, text: 'A regra da lenda não se aplica aos permanentes que você controla.' })]);
T('T estrangula', 0, 1, [staticAbility({ rules: { cantSearchLibraries: (c, p) => c.g.isOpponent(c.you, p) } })]);
T('T olha topo', 0, 1, [staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you } })]);
defineToken({ id: 'T esconderijo', name: 'T esconderijo', types: ['Land'], subtypes: [], colors: [], power: null, toughness: null, abilities: [hideaway(2)] });
defineToken({
  id: 'T reconfig', name: 'T reconfig', types: ['Artifact', 'Creature'], subtypes: ['Equipment', 'Cat'], colors: [], power: 1, toughness: 1,
  abilities: [attachedGets(() => [{ k: 'pt', p: 1, t: 1 }]), ...reconfigure('{1}')],
});
defineToken({
  id: 'T saga', name: 'T saga', types: ['Enchantment'], subtypes: ['Saga'], colors: [], power: null, toughness: null,
  abilities: [
    ...readAhead(3),
    chapter([1], function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'I — ganhe 1' }),
    chapter([2], function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: 'II — ganhe 2' }),
    chapter([3], function* (c) { gainLife(c.g, c.you, 3, c.source); }, { text: 'III — ganhe 3' }),
  ],
});
void keyword;

describe('cópia (CR 707)', () => {
  it('CR 707.5, 614.1c: entra como cópia — habilidades de entrar do modelo disparam e o marcador extra vale para criatura', () => {
    const tg = fixture({ battlefield: [['Wall of Omens'], []] });
    tg.choose('T clone: entrar como cópia', ['Wall of Omens']);
    const [id] = runEffect(tg, createTokens(tg.g, 0, 'T clone', 1));
    tg.resolveAll();
    expect(chars(tg.g, id).name).toBe('Wall of Omens');
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.state.zones.hand[0]).toHaveLength(1); // a Wall copiada compra uma carta ao entrar
  });
  it('CR 707.5, 306.5b: cópia de planeswalker entra com a lealdade impressa (mais a extra) e a exceção não lendário (707.9b)', () => {
    const tg = fixture({ battlefield: [["Elspeth, Sun's Champion"], []] });
    tg.choose('T clone: entrar como cópia', ["Elspeth, Sun's Champion"]);
    const [id] = runEffect(tg, createTokens(tg.g, 0, 'T clone', 1));
    expect(chars(tg.g, id).name).toBe("Elspeth, Sun's Champion");
    expect(tg.state.objects[id].counters.loyalty).toBe(5);
    expect(chars(tg.g, id).supertypes).not.toContain('Legendary');
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
  });
  it('CR 707.3: copiar uma cópia dá o que ela copia, com as exceções dela; sem copiar, fica como é', () => {
    const tg = fixture({ battlefield: [['Indomitable Ancients'], []] });
    tg.choose('T clone: entrar como cópia', ['Indomitable Ancients']);
    const [a] = runEffect(tg, createTokens(tg.g, 0, 'T clone', 1));
    tg.choose('T clone: entrar como cópia', [a]);
    const [b] = runEffect(tg, createTokens(tg.g, 0, 'T clone', 1));
    expect(chars(tg.g, b).name).toBe('Indomitable Ancients');
    expect(tg.pt(b)).toEqual([3, 11]);
    tg.choose('T clone: entrar como cópia', ['Não copiar']);
    const [c] = runEffect(tg, createTokens(tg.g, 0, 'T clone', 1));
    expect(tg.state.objects[c]?.zone).not.toBe('battlefield'); // 0/0 sem copiar
  });
  it('CR 707.2: "vira uma cópia até o fim do turno" acaba na limpeza; marcadores continuam', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true, counters: { '+1/+1': 1 } }, 'Indomitable Ancients'], []] });
    const id = tg.bf('T 2/2');
    becomeCopy({ g: tg.g, you: 0, source: id }, id, tg.bf('Indomitable Ancients'), { duration: { kind: 'endOfTurn' } });
    tg.refresh();
    expect(chars(tg.g, id).name).toBe('Indomitable Ancients');
    expect(tg.pt(id)).toEqual([3, 11]);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).name).toBe('T 2/2');
  });
});

describe('combate adicional (CR 500.8, 505.1a)', () => {
  it('CR 500.8: na fase principal, o combate adicional (e a fase principal adicional) vem logo depois da fase atual', () => {
    const tg = fixture({ battlefield: [[], []] });
    addCombatPhaseAfterCurrent(tg.g, { thenMain: true });
    expect(tg.state.turn.queue.slice(0, 7)).toEqual(['beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat', 'main2', 'beginCombat']);
  });
  it('CR 500.8: durante o combate, o adicional vem depois do fim deste combate, sem fase principal no meio', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true }], []] });
    tg.attack([['T 2/2', 1]]).passTo('declareBlockers');
    addCombatPhaseAfterCurrent(tg.g);
    expect(tg.state.turn.queue.slice(0, 4)).toEqual(['combatDamage', 'endCombat', 'beginCombat', 'declareAttackers']);
    expect(tg.state.turn.queue.indexOf('main2')).toBe(7);
  });
});

describe('tramar (CR 701.50)', () => {
  it('CR 701.50a: compra, descarta; marcador +1/+1 só se a descartada não for terreno', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true }], []], library: [['Counterspell', 'Forest'], []] });
    const id = tg.bf('T 2/2');
    tg.choose('Descarte', ['Counterspell']);
    runEffect(tg, connive(tg.g, id));
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    tg.choose('Descarte', ['Forest']);
    runEffect(tg, connive(tg.g, id));
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
  });
  it('CR 701.50b: fora do campo, o controlador pela última informação compra e descarta, sem marcador', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true }], []], hand: [['Counterspell'], []] });
    const id = tg.bf('T 2/2');
    runEffect(tg, destroy(tg.g, [id]));
    const antes = tg.state.zones.graveyard[0].length;
    runEffect(tg, connive(tg.g, id));
    expect(tg.state.zones.graveyard[0].length).toBe(antes + 1);
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});

describe('reunir (CR 701.47)', () => {
  it('CR 701.47a: sem Exército, cria Orc Army 0/0 e põe os marcadores; depois usa o mesmo', () => {
    const tg = fixture({ battlefield: [[], []] });
    const a = runEffect(tg, amass(tg.g, 0, 'Orc', 2))!;
    expect(chars(tg.g, a).name).toBe('Orc Army');
    expect(tg.pt(a)).toEqual([2, 2]);
    const b = runEffect(tg, amass(tg.g, 0, 'Orc', 1));
    expect(b).toBe(a);
    expect(tg.pt(a)).toEqual([3, 3]);
  });
  it('CR 701.47a: um Exército que não é Orc passa a ser também; com 0, a ficha 0/0 morre', () => {
    const tg = fixture({ battlefield: [[{ name: 'Zombie Army', token: true, counters: { '+1/+1': 1 } }], []] });
    const a = runEffect(tg, amass(tg.g, 0, 'Orc', 1))!;
    expect(chars(tg.g, a).subtypes).toEqual(expect.arrayContaining(['Zombie', 'Orc', 'Army']));
    const tg2 = fixture({ battlefield: [[], []] });
    runEffect(tg2, amass(tg2.g, 0, 'Orc', 0));
    expect(tg2.find('Orc Army')).toBeNull();
  });
});

describe('o Anel tenta você (CR 701.54)', () => {
  it('CR 701.54a-c: recebe o emblema, escolhe o Portador (lendário); sem criatura, tenta mesmo assim', () => {
    const tg = fixture({ battlefield: [[], []] });
    runEffect(tg, ringTempts(tg.g, 0));
    expect(ringTemptations(tg.g, 0)).toBe(1);
    const t2 = fixture({ battlefield: [[{ name: 'T 2/2', token: true }, { name: 'T 3/3', token: true }], []] });
    t2.choose('O Anel tenta você', ['T 2/2']);
    runEffect(t2, ringTempts(t2.g, 0));
    const id = t2.bf('T 2/2');
    expect(isRingBearer(t2.g, id, 0)).toBe(true);
    expect(chars(t2.g, id).supertypes).toContain('Legendary');
    t2.choose('O Anel tenta você', ['T 3/3']);
    runEffect(t2, ringTempts(t2.g, 0));
    expect(isRingBearer(t2.g, id, 0)).toBe(false);
    expect(isRingBearer(t2.g, t2.bf('T 3/3'), 0)).toBe(true);
    expect(buildView(t2.g, 0, null).players[0].ring).toEqual({ tempted: 2, bearer: t2.bf('T 3/3') });
    expect(buildView(t2.g, 0, null).battlefield.find((o) => o.id === t2.bf('T 3/3'))?.ringBearer).toBe(true);
  });
  it('CR 701.54c: o Portador não pode ser bloqueado por criaturas com força maior; tentado 2 vezes, compra e descarta ao atacar', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true }], [{ name: 'T 5/5', token: true }, { name: 'T 1/4', token: true }]] });
    runEffect(tg, ringTempts(tg.g, 0));
    runEffect(tg, ringTempts(tg.g, 0));
    let podem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'blockers') { podem = d.candidates.map((c) => c.obj); } return null; });
    const mao = tg.state.zones.hand[0].length;
    tg.attack([['T 2/2', 1]]).passTo('combatDamage');
    expect(podem).toEqual([tg.bf('T 1/4')]);
    expect(tg.state.zones.hand[0].length).toBe(mao); // comprou e descartou
    expect(tg.state.zones.graveyard[0].length).toBe(1);
  });
  it('CR 701.54c: tentado 4 vezes, dano de combate do Portador faz cada oponente perder 3; outro jogador ganhar o controle tira a designação', () => {
    const tg = fixture({ players: 3, battlefield: [[{ name: 'T 2/2', token: true }], [], []] });
    for (let i = 0; i < 4; i++) runEffect(tg, ringTempts(tg.g, 0));
    tg.attack([['T 2/2', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(40 - 2 - 3);
    expect(tg.life(2)).toBe(37);
  });
});

describe('regenerar (CR 701.19)', () => {
  it('CR 701.19a: o escudo substitui a destruição — remove o dano, vira e sai do combate; um escudo por destruição', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true, damage: 1 }], []] });
    const id = tg.bf('T 2/2');
    regenerate({ g: tg.g, you: 0, source: id }, id);
    tg.refresh();
    expect(buildView(tg.g, 0, null).battlefield.find((o) => o.id === id)?.regen).toBe(1);
    runEffect(tg, destroy(tg.g, [id]));
    expect(tg.state.objects[id]?.zone).toBe('battlefield');
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.objects[id].damage).toBe(0);
    runEffect(tg, destroy(tg.g, [id]));
    expect(tg.find('T 2/2')).toBeNull();
  });
  it('CR 701.19a: vale contra dano letal (ação de estado); CR 701.19c: "não pode ser regenerado" ignora o escudo', () => {
    const tg = fixture({ battlefield: [[{ name: 'T 2/2', token: true }, { name: 'T 3/3', token: true }], []] });
    const a = tg.bf('T 2/2');
    const b = tg.bf('T 3/3');
    regenerate({ g: tg.g, you: 0, source: a }, a);
    regenerate({ g: tg.g, you: 0, source: b }, b);
    tg.state.objects[a].damage = 5;
    tg.g.bump();
    tg.refresh();
    expect(tg.state.objects[a]?.zone).toBe('battlefield');
    runEffect(tg, destroy(tg.g, [b], { cantRegenerate: true }));
    expect(tg.find('T 3/3')).toBeNull();
    preventRegeneration({ g: tg.g, you: 0, source: a }, [a]);
    regenerate({ g: tg.g, you: 0, source: a }, a);
    runEffect(tg, destroy(tg.g, [a]));
    expect(tg.find('T 2/2')).toBeNull();
  });
});

describe('infectar (CR 702.90, 120.3b)', () => {
  it('CR 120.3b: dano de fonte com infectar a um jogador dá marcadores de veneno em vez de perda de vida', () => {
    const tg = fixture({ battlefield: [[{ name: 'T infectar', token: true }], []] });
    tg.attack([['T infectar', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(40);
    expect(tg.state.players[1].counters.poison).toBe(2);
  });
});

describe('palavras-chave engatilhadas de criaturas', () => {
  it('CR 702.79a: persistir volta com um marcador -1/-1; já com -1/-1, não volta', () => {
    const tg = fixture({ battlefield: [[{ name: 'T persistir', token: false }], []] });
    // como carta (não ficha), para poder voltar: a definição de teste numa carta
    const id = tg.bf('T persistir');
    runEffect(tg, destroy(tg.g, [id]));
    tg.resolveAll();
    const novo = tg.bf('T persistir');
    expect(tg.state.objects[novo].counters['-1/-1']).toBe(1);
    expect(tg.pt(novo)).toEqual([1, 1]);
    runEffect(tg, destroy(tg.g, [novo]));
    tg.resolveAll();
    expect(tg.find('T persistir')).toBeNull();
  });
  it('CR 702.121a: corpo a corpo conta os oponentes atacados (jogadores) neste combate', () => {
    const tg = fixture({ players: 3, battlefield: [[{ name: 'T corpo a corpo', token: true }, { name: 'T 2/2', token: true }], [], []] });
    tg.attack([['T corpo a corpo', 1], ['T 2/2', 2]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('T corpo a corpo'))).toEqual([3, 3]);
  });
  it('CR 702.105a: destronar só dispara atacando o jogador com mais vida (ou empatado)', () => {
    const tg = fixture({ players: 3, battlefield: [[{ name: 'T destronar', token: true }], [], []] });
    tg.state.players[2].life = 50;
    tg.attack([['T destronar', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('T destronar')].counters['+1/+1'] ?? 0).toBe(0);
    const t2 = fixture({ players: 3, battlefield: [[{ name: 'T destronar', token: true }], [], []] });
    t2.state.players[2].life = 50;
    t2.attack([['T destronar', 2]]).passTo('declareBlockers');
    expect(t2.state.objects[t2.bf('T destronar')].counters['+1/+1']).toBe(1);
  });
  it('CR 702.181a: mobilizar cria fichas viradas e atacando e as sacrifica no início da próxima etapa final', () => {
    const tg = fixture({ battlefield: [[{ name: 'T mobilizar', token: true }], []] });
    tg.attack([['T mobilizar', 1]]).passTo('declareBlockers');
    const fichas = tg.all('Warrior');
    expect(fichas).toHaveLength(2);
    expect(fichas.every((id) => tg.state.objects[id].tapped && tg.state.combat!.attackers.some((a) => a.id === id))).toBe(true);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(37);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.all('Warrior')).toHaveLength(0);
  });
  it('CR 702.54a: sede de sangue — entra com os marcadores só se um oponente sofreu dano neste turno', () => {
    const tg = fixture({ battlefield: [[], []] });
    const [a] = runEffect(tg, createTokens(tg.g, 0, 'T sede', 1));
    expect(tg.state.objects[a].counters['+1/+1'] ?? 0).toBe(0);
    tg.state.turnStats[1].damageTaken = 1;
    const [b] = runEffect(tg, createTokens(tg.g, 0, 'T sede', 1));
    expect(tg.state.objects[b].counters['+1/+1']).toBe(2);
  });
  it('CR 701.37a-b: monstruosidade só uma vez; a designação aparece na mesa', () => {
    const tg = fixture({ battlefield: [[{ name: 'T monstro', token: true }, 'Forest', 'Forest'], []] });
    const id = tg.bf('T monstro');
    tg.activate('T monstro').resolve();
    expect(isMonstrous(tg.g, id)).toBe(true);
    expect(tg.pt(id)).toEqual([4, 4]);
    tg.activate('T monstro').resolve();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(buildView(tg.g, 0, null).battlefield.find((o) => o.id === id)?.monstrous).toBe(true);
  });
  it('CR 702.100a: evoluir quando entra criatura sua com força ou resistência maior', () => {
    const tg = fixture({ battlefield: [[{ name: 'T evoluir', token: true }], []] });
    const id = tg.bf('T evoluir');
    runEffect(tg, createTokens(tg.g, 0, 'T 2/2', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
    runEffect(tg, createTokens(tg.g, 0, 'T 1/4', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    runEffect(tg, createTokens(tg.g, 1, 'T 5/5', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1); // só criaturas que você controla
  });
});

describe('confronto, ler adiante, polimorfo, esconderijo, reconfigurar, ciclagem de tipo', () => {
  it('CR 701.30a-d: confronto — vence quem revelou o maior valor de mana; cada um escolhe topo ou fundo', () => {
    const tg = fixture({ battlefield: [[], []], library: [['Zetalpa, Primal Dawn', 'Forest'], ['Sol Ring', 'Island']] });
    tg.yes('Confronto: pôr Zetalpa', false).yes('Confronto: pôr Sol Ring', true);
    const venceu = runEffect(tg, clash(tg.g, 0, 1));
    expect(venceu).toBe(true);
    expect(tg.names(0, 'library')[0]).toBe('Zetalpa, Primal Dawn');
    expect(tg.names(1, 'library')).toEqual(['Island', 'Sol Ring']);
  });
  it('CR 702.155a-b: ler adiante — entra com o número escolhido e só dispara esse capítulo no turno em que entrou', () => {
    const tg = fixture({ battlefield: [[], []] });
    tg.number('Ler adiante', 2);
    runEffect(tg, createTokens(tg.g, 0, 'T saga', 1));
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.state.objects[tg.bf('T saga')].counters.lore).toBe(2);
  });
  it('CR 702.73a: polimorfo é todos os tipos de criatura, também na mão (CR 604.3)', () => {
    const tg = fixture({ battlefield: [[{ name: 'T polimorfo', token: true }], []] });
    expect(chars(tg.g, tg.bf('T polimorfo')).subtypes).toEqual(expect.arrayContaining(['Goblin', 'Vampire', 'Orc', 'Ninja']));
    const naMao = createObject(tg.g, { def: 'T polimorfo', owner: 0, zone: 'hand' });
    expect(chars(tg.g, naMao.id).subtypes).toEqual(expect.arrayContaining(['Elf', 'Villain']));
    expect(hasKw(tg.g, naMao.id, 'changeling')).toBe(true);
  });
  it('CR 702.75a: esconderijo exila uma virada para baixo (só o controlador vê) e põe o resto no fundo', () => {
    const tg = fixture({ battlefield: [[], []], library: [['Counterspell', 'Sol Ring', 'Island', 'Swamp'], []] });
    tg.choose('Esconderijo 2', ['Sol Ring']);
    const [land] = runEffect(tg, createTokens(tg.g, 0, 'T esconderijo', 1));
    tg.resolveAll();
    const [ex] = linkedExiled(tg.g, land, 'hideaway');
    expect(tg.state.objects[ex].faceDown).toBe(true);
    expect(buildView(tg.g, 0, null).exile.find((o) => o.id === ex)?.name).toBe('Sol Ring');
    expect(buildView(tg.g, 1, null).exile.find((o) => o.id === ex)?.def).toBe('');
    expect(tg.names(0, 'library')).toEqual(['Island', 'Swamp', 'Counterspell']);
  });
  it('CR 702.151a-b: reconfigurar anexa (deixa de ser criatura e perde os tipos de criatura) e desanexa (volta a ser)', () => {
    const tg = fixture({ battlefield: [[{ name: 'T reconfig', token: true }, { name: 'T 2/2', token: true }, 'Forest', 'Forest'], []] });
    const eq = tg.bf('T reconfig');
    const alvo = tg.bf('T 2/2');
    tg.choose('outra criatura alvo', ['T 2/2']).activate('T reconfig', 'anexe').resolve();
    expect(tg.state.objects[eq].attachedTo).toBe(alvo);
    expect(isCreature(tg.g, eq)).toBe(false);
    expect(chars(tg.g, eq).subtypes).toEqual(['Equipment']);
    expect(tg.pt(alvo)).toEqual([3, 3]);
    tg.activate('T reconfig', 'desanexe').resolve();
    expect(tg.state.objects[eq].attachedTo).toBeNull();
    expect(isCreature(tg.g, eq)).toBe(true);
  });
  it('CR 702.29e: ciclagem de tipo procura uma carta do tipo e põe na mão', () => {
    const tg = fixture({ battlefield: [[{ name: 'Forest' }], []], library: [['Island', 'Swamp', 'Forest'], []] });
    const carta = createObject(tg.g, { def: 'T ciclagem', owner: 0, zone: 'hand', card: null });
    tg.refresh();
    tg.choose('Procure uma carta de pântano', ['Swamp']).activate('T ciclagem').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    void carta;
  });
});

describe('ganchos de regra (lote2-d)', () => {
  it('CR 704.5j: "a regra da lenda não se aplica aos permanentes que você controla"', () => {
    const tg = fixture({ battlefield: [[{ name: 'T lenda', token: true }, { name: 'T lenda', token: true }, { name: 'T sem lenda', token: true }], [{ name: 'T lenda', token: true }, { name: 'T lenda', token: true }]] });
    expect(tg.all('T lenda').filter((id) => controllerOf(tg.g, id) === 0)).toHaveLength(2);
    expect(tg.all('T lenda').filter((id) => controllerOf(tg.g, id) === 1)).toHaveLength(1);
  });
  it('CR 701.23 (Stranglehold): oponentes não procuram; a vista mostra o topo só a quem pode olhá-lo', () => {
    const tg = fixture({ battlefield: [[{ name: 'T estrangula', token: true }, { name: 'T olha topo', token: true }], []], library: [['Island'], ['Forest', 'Swamp']] });
    expect(buildView(tg.g, 0, null).players[0].topCard?.name).toBe('Island');
    expect(buildView(tg.g, 1, null).players[0].topCard).toBeUndefined();
    expect(runEffect(tg, searchLibrary(tg.g, 1, 1, { max: 1, prompt: 'Procure' }))).toEqual([]);
    tg.choose('Procure', ['Island']);
    expect(runEffect(tg, searchLibrary(tg.g, 0, 0, { max: 1, prompt: 'Procure' }))).toHaveLength(1);
  });
});
