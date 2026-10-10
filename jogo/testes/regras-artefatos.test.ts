import { describe, expect, it } from 'vitest';
import { activated, addEffect, chars, crew, defineToken, isCreature, mana, staticAbility, triggered } from '../motor/api.ts';
import { crewCandidates, canAfford, payMana } from '../motor/costs.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { parseCost } from '../motor/mana.ts';
import { reselectAttacker, reselectAttackTargets, validateAttack } from '../motor/combat.ts';
import { fixture, runEffect } from './artefatos.ts';
import { cost } from '../motor/dsl.ts';

const vehicle = 'Teste tripulação';
defineToken({ id: vehicle, name: vehicle, types: ['Artifact'], subtypes: ['Vehicle'], colors: [], power: 4, toughness: 5, abilities: [crew(3), mana('U')] });
const tapper = 'Teste virar artefatos';
defineToken({ id: tapper, name: tapper, types: ['Creature'], subtypes: [], colors: [], power: 1, toughness: 1, abilities: [activated('Tap two untapped artifacts you control', function* () {})] });
const mandatory = 'Teste ataque obrigatório';
defineToken({ id: mandatory, name: mandatory, types: ['Creature'], subtypes: [], colors: [], power: 2, toughness: 2, abilities: [staticAbility({ rules: { attacksIfAble: (c, id) => id === c.source } })] });
const locked = 'Teste não desvirar';
defineToken({ id: locked, name: locked, types: ['Artifact'], subtypes: [], colors: [], power: null, toughness: null, abilities: [staticAbility({ rules: { cantUntapDuringUntapOf: (c, id, active) => id === c.source && active === c.you } })] });
const stateful = 'Teste gatilho de estado';
defineToken({ id: stateful, name: stateful, types: ['Artifact'], subtypes: [], colors: [], power: null, toughness: null, abilities: [triggered({ kind: 'state', check: (c) => !!c.obj.counters.page }, function* () {}, { text: 'Quando tem marcador' })] });

describe('custos de artefatos e tripulação', () => {
  it('parser aceita virar artefatos e devolver artefato ao dono', () => {
    expect(cost('Tap two untapped artifacts you control')[0].k).toBe('tapPermanents');
    expect(cost("{U}, {T}, Return an artifact you control to its owner's hand").map((p) => p.k)).toEqual(['mana', 'tap', 'returnPermanent']);
  });
  it('artefatos com enjoo podem ser virados sem símbolo {T}; fora de fase e dos oponentes não', () => {
    const tg = fixture({ battlefield: [[{ name: tapper, token: true }, { name: 'Sol Ring', ready: false }, 'Arcane Signet'], ['Sol Ring']] });
    tg.state.objects[tg.bf('Arcane Signet')].phasedOut = true; tg.g.bump(); tg.refresh();
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.kind === 'activate')).toBe(false);
  });
  it('tripular usa outras criaturas com enjoo, aceita excesso e só anima na resolução', () => {
    const tg = fixture({ battlefield: [[{ name: vehicle, token: true }, { name: 'Indomitable Ancients', ready: false }, { name: 'Elvish Mystic', ready: false }, 'Silver Myr'], []] });
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['Silver Myr']).choose('Tripular:', ['done']).activate(vehicle);
    expect(isCreature(tg.g, tg.bf(vehicle))).toBe(false);
    tg.resolveAll(); expect(tg.pt(tg.bf(vehicle))).toEqual([4, 5]);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true);
    expect(crewCandidates(tg.g, 0, tg.bf(vehicle))).not.toContain(tg.bf(vehicle));
    tg.passTo('upkeep', 1); expect(isCreature(tg.g, tg.bf(vehicle))).toBe(false);
  });
  it('não inclui força negativa de criaturas que não serão usadas na tripulação', () => {
    const tg = fixture({ battlefield: [[{ name: vehicle, token: true }, 'Indomitable Ancients', 'Elvish Mystic', 'Wall of Omens'], []] });
    const wall = tg.bf('Wall of Omens');
    addEffect(tg.g, { source: wall, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [wall], mods: [{ k: 'pt', p: -8, t: 0 }] }); tg.refresh();
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.kind === 'activate' && a.obj === tg.bf(vehicle))).toBe(true);
  });
});

describe('improvisar: mana primeiro, pagamento depois', () => {
  it('o planejador não conta um mesmo artefato como fonte de mana e de improvisar', () => {
    const tg = fixture({ battlefield: [['Island', 'Sol Ring'], []] });
    const purpose = { kind: 'effect' as const };
    expect(canAfford(tg.g, 0, parseCost('{3}{U}'), { purpose, improvise: true })).toBe(false);
    expect(canAfford(tg.g, 0, parseCost('{2}{U}'), { purpose, improvise: true })).toBe(true);
    expect(canAfford(tg.g, 0, parseCost('{U}{U}'), { purpose, improvise: true })).toBe(false);
  });
  it('ativar mana de um artefato antes de improvisar permite usar os outros artefatos', () => {
    const tg = fixture({ battlefield: [['Island', 'Sol Ring', 'Arcane Signet'], []] });
    tg.script.push((d) => d.kind === 'payment' ? { kind: 'payment', auto: true } : null);
    const paid = runEffect(tg, payMana(tg.g, 0, parseCost('{3}{U}'), { purpose: { kind: 'effect' }, improvise: true, canCancel: true, label: 'teste' }));
    expect(paid).not.toBeNull(); expect(tg.state.players[0].manaPool).toHaveLength(0);
  });
  it('depois de virar para improvisar, não oferece mais habilidades de mana e cancelamento continua disponível', () => {
    const tg = fixture({ battlefield: [['Island', 'Sol Ring'], []] });
    const gen = payMana(tg.g, 0, parseCost('{1}{U}'), { purpose: { kind: 'effect' }, improvise: true, canCancel: true, label: 'teste' });
    const first = gen.next(); if (first.done || first.value.kind !== 'payment') throw new Error('Pagamento esperado');
    const improviser = first.value.sources.find((s) => s.id.startsWith('improvise:'))!;
    const next = gen.next({ kind: 'payment', activate: { source: improviser.id } });
    if (next.done || next.value.kind !== 'payment') throw new Error('Pagamento esperado');
    expect(next.value.sources).toHaveLength(0); expect(next.value.canAuto).toBe(false);
    expect(gen.next({ kind: 'payment', cancel: true }).value).toBeNull();
  });
});

describe('combate e desvirar', () => {
  it('impedimento da etapa de desvirar não consome atordoamento e não bloqueia efeitos de desvirar', () => {
    const tg = fixture({ battlefield: [[{ name: locked, token: true, tapped: true, counters: { stun: 1 } }], []] });
    tg.passTo('upkeep', 0); expect(tg.state.objects[tg.bf(locked)].tapped).toBe(true); expect(tg.state.objects[tg.bf(locked)].counters.stun).toBe(1);
  });
  it('gatilho de estado não duplica enquanto estiver na pilha e dispara de novo após resolver se o estado persiste', () => {
    const tg = fixture({ battlefield: [[{ name: stateful, token: true, counters: { page: 1 } }], []] });
    expect(tg.state.zones.stack).toHaveLength(1); tg.refresh(); expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve(); expect(tg.state.zones.stack).toHaveLength(1);
    tg.state.objects[tg.bf(stateful)].counters.page = 0; tg.g.bump(); tg.resolveAll(); expect(tg.state.zones.stack).toHaveLength(0);
  });
  it('exigência de ataque estática não obriga pagar Propaganda/Ghostly Prison', () => {
    const tg = fixture({ battlefield: [[{ name: mandatory, token: true }], []] }); expect(validateAttack(tg.g, 0, [])).not.toBeNull();
    const taxed = fixture({ battlefield: [[{ name: mandatory, token: true }], ['Ghostly Prison']] }); expect(validateAttack(taxed.g, 0, [])).toBeNull();
  });
  it('reseleção ignora custos, exclui próprios alvos e conserva a declaração original', () => {
    const tg = fixture({ players: 3, battlefield: [['Elvish Mystic'], [], ['Ghostly Prison']] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers'); const id = tg.bf('Elvish Mystic');
    expect(reselectAttackTargets(tg.g, id)).toContainEqual({ kind: 'player', id: 2 });
    expect(reselectAttacker(tg.g, id, { kind: 'player', id: 0 })).toBe(false);
    expect(reselectAttacker(tg.g, id, { kind: 'player', id: 2 })).toBe(true);
    expect(tg.state.turnStats[0].attackedPlayers).toEqual([1]); tg.passTo('main2'); expect(tg.life(2)).toBe(39);
  });
});
