// Mecânicas de criaturas, permanentes, combate e fichas (lote 2, agente D). Cada uma segue a regra citada (conferida em
// fontes-oficiais/MagicCompRules-2026-09-25.txt): entrar como cópia e "vira uma cópia" (CR 707, 614.1c), combate
// adicional (500.8), tramar (701.50), reunir (701.47), o Anel (701.54), regenerar (701.19), persistir (702.79), corpo a
// corpo (702.121), destronar (702.105), mobilizar (702.181), sede de sangue (702.54), monstruosidade (701.37), evoluir
// (702.100), confronto (701.30), ler adiante (702.155), polimorfo (702.73), imprimir (607.2a), esconderijo (702.75),
// reconfigurar (702.151), ciclagem de tipo (702.29e) e investigar (701.16). As fichas Food, Clue, Blood, Orc Army e
// Warrior vermelha ficam em cartas/fichas.ts (as daqui só as criam pelo id).

import {
  addCounters, attach, controlledBy, createTokens, creaturesOf, discard, draw, loseLife, moveObjects, putOntoBattlefield,
  sacrifice, searchLibrary, shuffleLibrary, unattach, untap,
} from './actions.ts';
import { chooseItems, chooseNumber, objItem, playerItem, yesNo } from './ask.ts';
import { chars, controllerOf, copyValuesChars, isCreature, isLand, manaValue, nameOf, power } from './chars.ts';
import { defineAbility, defineEmblem, type AbilityDef, type ActivatedDef, type EnterEvent, type Gen, type ReplacementDef, type SCtx, type StaticDef, type TriggeredDef, type TriggerSpec } from './defs.ts';
import { activated, and, asEnters, cost, is, keyword, lkiChars, lkiObj, on, t, tgt, triggered } from './dsl.ts';
import { allCreatureTypes, delayed, nextEndStepTrigger, untilEndOfTurn } from './efeitos.ts';
import type { G } from './game-context.ts';
import { copiableValues, mayCastFree } from './mecanicas.ts';
import { shuffle } from './rng.ts';
import { addEffect } from './state.ts';
import { emit } from './triggers.ts';
import { createEmblem } from './veneno-emblema.ts';
import type { Chars, CopyExcept, CopyValues, Duration, ObjId, PlayerId, TargetRef } from './types.ts';

type C = { g: G; you: PlayerId; source: ObjId };

// ---------------------------------------------------------------------------
// Cópia (CR 707.2-707.5, 707.9, 614.1c)
// ---------------------------------------------------------------------------
/** junta as exceções de cópia (CR 707.9b: as da cópia copiada continuam valendo; as novas se somam) */
export function mergeExcept(a?: CopyExcept, b?: CopyExcept): CopyExcept | undefined {
  if (!a) return b;
  if (!b) return a;
  const lista = (x?: string[], y?: string[]) => (x || y ? [...(x ?? []), ...(y ?? [])] : undefined);
  const r: CopyExcept = { ...a, ...b };
  for (const k of ['addTypes', 'addSubtypes', 'addAbilities', 'addKeywords'] as const) {
    const v = lista(a[k], b[k]);
    if (v) r[k] = v; else delete r[k];
  }
  return r;
}

/** valores copiáveis do modelo (o que ele estiver copiando, CR 707.3) com exceções a mais (CR 707.9) */
export function copyWithExcept(g: G, model: ObjId, except?: CopyExcept): CopyValues {
  const v = copiableValues(g, model);
  const e = mergeExcept(v.except, except);
  return e ? { ...v, except: e } : { def: v.def, face: v.face };
}

/**
 * "Você pode fazer [este permanente] entrar como uma cópia de [candidato]" (CR 707.5, 614.1c): substituição "ao entrar".
 * Só permanentes que já estão no campo podem ser escolhidos (CR 614.12; ruling 9 de Spark Double). As substituições
 * "ao entrar" do modelo também se aplicam e as habilidades de entrar dele disparam (o motor recalcula em
 * putOntoBattlefield); um planeswalker copiado entra com a lealdade impressa (CR 306.5b). `except` são as exceções da
 * cópia (CR 707.9b: viram valores copiáveis); `then` acrescenta o que depende do resultado (marcadores a mais, CR 707.9f).
 */
export function entersAsCopy(opts: {
  label: string;
  what: string;
  text: string;
  candidates: (c: SCtx, ev: EnterEvent) => ObjId[];
  except?: (c: SCtx, ev: EnterEvent) => CopyExcept | undefined;
  then?: (c: SCtx, ev: EnterEvent, copia: Chars) => void;
}): ReplacementDef {
  return asEnters(function* (c, ev) {
    const s = c.g.state;
    const cands = opts.candidates(c, ev).filter((id) => id !== ev.obj && s.objects[id]?.zone === 'battlefield' && !s.objects[id].phasedOut);
    if (!cands.length) return;
    const itens = [{ id: '', label: 'Não copiar' }, ...cands.map((id) => objItem(c.g, id, nameOf(c.g, id)))];
    const [esc] = yield* chooseItems(c.g, ev.controller, `${opts.label}: entrar como cópia de ${opts.what}?`, itens, 1, 1);
    if (!esc) return;
    const modelo = Number(esc);
    ev.copyOf = copyWithExcept(c.g, modelo, opts.except?.(c, ev));
    const dono = ev.obj >= 0 ? (s.objects[ev.obj]?.owner ?? ev.controller) : ev.controller;
    opts.then?.(c, ev, copyValuesChars(ev.copyOf, dono));
    c.g.log(`${opts.label} entra como cópia de ${nameOf(c.g, modelo)}.`, { rule: '707.5' });
  }, opts.text);
}

/**
 * "[Este permanente] vira uma cópia de [modelo] [até o fim do turno], exceto…" (CR 707.2, 707.9). Não é entrar no campo:
 * as habilidades de entrar do modelo não se aplicam (ruling 5 de Irma). Sem duração, vale enquanto ele estiver no campo.
 * O que já afetava o permanente continua (marcadores, Auras, efeitos: ruling 6 de Vesuvan Drifter).
 */
export function becomeCopy(c: C, obj: ObjId, model: ObjId, opts: { except?: CopyExcept; duration?: Duration } = {}): boolean {
  const g = c.g;
  if (g.state.objects[obj]?.zone !== 'battlefield' || !g.state.objects[model]) return false;
  const antes = nameOf(g, obj);
  const of = copyWithExcept(g, model, opts.except);
  addEffect(g, { source: c.source, sourceDef: '', controller: c.you, duration: opts.duration ?? { kind: 'whileOnBattlefield', obj }, affected: [obj], mods: [{ k: 'copy', of }] });
  g.log(`${antes} vira uma cópia de ${nameOf(g, model)}.`, { rule: '707.2' });
  return true;
}

// ---------------------------------------------------------------------------
// Combate adicional (CR 500.8, 505.1a, 506.1): addCombatPhaseAfterCurrent(g, { thenMain }) em motor/turn.ts
// ---------------------------------------------------------------------------

/** "desvire todas as criaturas atacantes" (Hellkite Charger, Scourge of the Throne) */
export function untapAttackers(g: G): void {
  for (const a of g.state.combat?.attackers ?? []) if (!a.removed && g.state.objects[a.id]) untap(g, a.id);
}

/** é a primeira fase de combate do turno? (Genji Glove) */
export function isFirstCombat(g: G): boolean {
  return g.state.turn.combatCount <= 1;
}

/** "no início da sua segunda fase principal" (CR 505.1b: conta as fases principais do turno) */
export function onSecondMain(): TriggerSpec {
  return on.custom((e, c) => e.type === 'step' && e.step === 'main2' && e.active === c.you && c.g.state.turn.mainPhaseCount === 2);
}

// ---------------------------------------------------------------------------
// Tramar (CR 701.50)
// ---------------------------------------------------------------------------
function controladorLki(g: G, id: ObjId): PlayerId | null {
  if (g.state.objects[id]?.zone === 'battlefield') return controllerOf(g, id);
  return lkiChars(g, id)?.controller ?? lkiObj(g, id)?.controller ?? null;
}

/**
 * O permanente trama N (CR 701.50a, 701.50d): o controlador compra N cartas, descarta N e põe um marcador +1/+1 nele
 * para cada carta que não é terreno descartada. Fora do campo, usa a última informação (701.50b): o jogador compra e
 * descarta, sem marcador (ruling 11 de Lethal Scheme). Trama mesmo que nada seja descartado (701.50f).
 */
export function* connive(g: G, obj: ObjId, n = 1): Gen<void> {
  if (n <= 0) return; // CR 701.50e
  const p = controladorLki(g, obj);
  if (p === null || g.state.players[p].left) return;
  g.log(`${g.state.objects[obj] ? nameOf(g, obj) : lkiChars(g, obj)?.name ?? 'O permanente'} trama.`, { rule: '701.50a' });
  yield* draw(g, p, n);
  const descartadas = yield* discard(g, p, n);
  const naoTerrenos = descartadas.filter((id) => g.state.objects[id] && !isLand(g, id)).length;
  if (naoTerrenos > 0 && g.state.objects[obj]?.zone === 'battlefield') addCounters(g, { kind: 'obj', id: obj }, '+1/+1', naoTerrenos, p);
  emit(g, [{ type: 'connive', obj, player: p, discarded: descartadas }]);
}

/** vários tramam ao mesmo tempo (CR 701.50c): em ordem APNAP, cada controlador escolhe qual trama primeiro */
export function* conniveEach(g: G, ids: ObjId[]): Gen<void> {
  let resto = [...ids];
  while (resto.length) {
    const ordem = g.apnap();
    const p = ordem.find((x) => resto.some((id) => controladorLki(g, id) === x)) ?? controladorLki(g, resto[0]);
    const deles = resto.filter((id) => controladorLki(g, id) === p);
    let id = deles[0] ?? resto[0];
    if (deles.length > 1 && p !== null) {
      const [esc] = yield* chooseItems(g, p, 'Tramar: escolha qual criatura trama agora', deles.map((x) => objItem(g, x, g.state.objects[x] ? nameOf(g, x) : lkiChars(g, x)?.name ?? '?')), 1, 1);
      id = Number(esc);
    }
    resto = resto.filter((x) => x !== id);
    yield* connive(g, id);
  }
}

/** "Sempre que uma criatura que você controla trama" (Glorious Purpose, Iron Monger, Ultron): c.event.criatura */
export function onYouConnive(): TriggerSpec {
  return on.custom((e, c) => e.type === 'connive' && e.player === c.you ? { criatura: e.obj } : false);
}

// ---------------------------------------------------------------------------
// Reunir (CR 701.47)
// ---------------------------------------------------------------------------
/**
 * Reunir [subtipo] N (CR 701.47a): sem um Exército, cria uma ficha 0/0 preta "[subtipo] Army" (em cartas/fichas.ts, id
 * "Orc Army" ou "Zombie Army"), que entra antes de receber os marcadores (ruling 6); escolhe um Exército seu, põe N
 * marcadores +1/+1 nele e, se não for do subtipo, ele passa a ser também. Devolve o Exército reunido (701.47c), mesmo
 * que não tenha recebido marcadores.
 */
export function* amass(g: G, p: PlayerId, subtype: string, n: number): Gen<ObjId | null> {
  if (g.state.players[p].left) return null;
  const exercitos = () => creaturesOf(g, p).filter((id) => chars(g, id).subtypes.includes('Army'));
  if (!exercitos().length) yield* createTokens(g, p, `${subtype} Army`, 1);
  const cands = exercitos();
  let army: ObjId | null = cands[0] ?? null;
  if (cands.length > 1) {
    const [esc] = yield* chooseItems(g, p, `Reunir ${subtype} ${n}: escolha o Exército que recebe os marcadores`, cands.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
    army = Number(esc);
  }
  if (army !== null) {
    if (n > 0) addCounters(g, { kind: 'obj', id: army }, '+1/+1', n, p);
    if (!chars(g, army).subtypes.includes(subtype)) {
      addEffect(g, { source: army, sourceDef: '', controller: p, duration: { kind: 'whileOnBattlefield', obj: army }, affected: [army], mods: [{ k: 'addTypes', subtypes: [subtype] }] });
    }
  }
  g.log(`${g.state.players[p].name} reúne ${subtype} ${n}.`, { rule: '701.47a' });
  emit(g, [{ type: 'amass', player: p, army }]);
  return army;
}

// ---------------------------------------------------------------------------
// O Anel tenta você (CR 701.54)
// ---------------------------------------------------------------------------
/** o Portador do Anel de `p` (CR 701.54e: no campo, sob o controle dele, com a designação) */
export function isRingBearer(g: G, id: ObjId, p?: PlayerId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.data.ringBearer === undefined) return false;
  const dono = o.data.ringBearer as PlayerId;
  return dono === controllerOf(g, id) && (p === undefined || dono === p);
}

export function ringBearerOf(g: G, p: PlayerId): ObjId | null {
  return g.state.zones.battlefield.find((id) => isRingBearer(g, id, p)) ?? null;
}

function emblemaDoAnel(g: G, p: PlayerId): ObjId | null {
  return g.state.zones.command.find((id) => g.state.objects[id]?.def === 'The Ring' && g.state.objects[id].owner === p) ?? null;
}

/** quantas vezes o Anel tentou o jogador nesta partida (as habilidades do emblema vêm em ordem, ruling 6 de Sauron) */
export function ringTemptations(g: G, p: PlayerId): number {
  const e = emblemaDoAnel(g, p);
  return e === null ? 0 : ((g.state.objects[e].data.tempted as number | undefined) ?? 0);
}

const nivelDoEmblema = (c: { g: G; source: ObjId }): number => (c.g.state.objects[c.source]?.data.tempted as number | undefined) ?? 0;

/** "o Portador do Anel do bloqueador sacrifica-o no fim do combate" (nível 3) */
const SACRIFICA_BLOQUEADOR = defineAbility('ring:sacrificaBloqueador', triggered({ kind: 'event', match: (e) => e.type === 'step' && e.step === 'endCombat' }, function* (c) {
  const id = c.data.bloqueador as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* sacrifice(c.g, [id]);
}, { text: 'No fim do combate, o controlador da criatura que bloqueou o Portador do Anel a sacrifica.' }));

/**
 * The Ring (CR 701.54c): o emblema que o jogador recebe na primeira vez que o Anel o tenta. A cada tentação ele ganha a
 * próxima habilidade (contadas em data.tempted): 1) o Portador do Anel é lendário e não pode ser bloqueado por criaturas
 * com força maior; 2) sempre que ele ataca, compre e descarte; 3) sempre que ele fica bloqueado por uma criatura, o
 * controlador dela a sacrifica no fim do combate; 4) sempre que ele causa dano de combate a um jogador, cada oponente
 * perde 3 de vida.
 */
defineEmblem({
  id: 'The Ring', name: 'The Ring',
  abilities: [
    {
      kind: 'static',
      affects: (c, o) => isRingBearer(c.g, o.id, c.you),
      mods: () => [{ k: 'addTypes', supertypes: ['Legendary'] }],
      rules: { canBeBlockedBy: (c, attacker, blocker) => !(isRingBearer(c.g, attacker, c.you) && power(c.g, blocker) > power(c.g, attacker)) },
      text: 'Seu Portador do Anel é lendário e não pode ser bloqueado por criaturas com força maior.',
    },
    triggered(on.custom((e, c) => e.type === 'attackers' && nivelDoEmblema(c) >= 2 && e.attackers.some((a) => isRingBearer(c.g, a.obj, c.you))), function* (c) {
      yield* draw(c.g, c.you, 1);
      yield* discard(c.g, c.you, 1);
    }, { text: 'Tentado 2 vezes ou mais: sempre que seu Portador do Anel ataca, compre uma carta, depois descarte uma carta.' }),
    triggered(on.custom((e, c) => {
      if (e.type !== 'blockers' || nivelDoEmblema(c) < 3) return false;
      return e.blocks.filter(([, a]) => isRingBearer(c.g, a, c.you)).map(([b]) => ({ bloqueador: b }));
    }), function* (c) {
      delayed(c, SACRIFICA_BLOQUEADOR.id!, { data: { bloqueador: c.event.bloqueador }, expiresTurn: c.g.state.turn.number });
    }, { text: 'Tentado 3 vezes ou mais: sempre que seu Portador do Anel fica bloqueado por uma criatura, o controlador dela a sacrifica no fim do combate.' }),
    triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && nivelDoEmblema(c) >= 4 && isRingBearer(c.g, e.source, c.you)), function* (c) {
      for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 3, c.source);
    }, { text: 'Tentado 4 vezes ou mais: sempre que seu Portador do Anel causa dano de combate a um jogador, cada oponente perde 3 de vida.' }),
  ],
});

/**
 * "O Anel tenta você" (CR 701.54a-d): sem o emblema The Ring, recebe-o; o emblema ganha a próxima habilidade; escolha uma
 * criatura que você controla (obrigatório se tiver, ruling 7) para ser (ou continuar) seu Portador do Anel. Tenta mesmo
 * sem criaturas (ruling 4). Devolve o Portador escolhido.
 */
export function* ringTempts(g: G, p: PlayerId): Gen<ObjId | null> {
  if (g.state.players[p].left) return null;
  let emb = emblemaDoAnel(g, p);
  if (emb === null) emb = createEmblem(g, p, 'The Ring');
  if (emb === null) return null;
  const e = g.state.objects[emb];
  e.data.tempted = ((e.data.tempted as number | undefined) ?? 0) + 1;
  const cands = creaturesOf(g, p);
  let bearer: ObjId | null = null;
  if (cands.length) {
    const [esc] = yield* chooseItems(g, p, `O Anel tenta você (${e.data.tempted}ª vez): escolha a criatura que você controla que será o seu Portador do Anel`, cands.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
    bearer = Number(esc);
    for (const id of g.state.zones.battlefield) if (g.state.objects[id].data.ringBearer === p) delete g.state.objects[id].data.ringBearer;
    g.state.objects[bearer].data.ringBearer = p;
  }
  g.bump();
  g.log(`O Anel tenta ${g.state.players[p].name} (${e.data.tempted}ª vez)${bearer !== null ? `; ${nameOf(g, bearer)} é o Portador do Anel` : ''}.`, { rule: '701.54a' });
  emit(g, [{ type: 'ringTempts', player: p, bearer }]);
  return bearer;
}

// ---------------------------------------------------------------------------
// Regenerar (CR 701.19)
// ---------------------------------------------------------------------------
/** "Regenere [permanente]": um escudo para a próxima destruição neste turno (CR 701.19a; aplicado em actions.ts destroy
 *  e nas ações de estado de dano letal) */
export function regenerate(c: C, id: ObjId): void {
  if (c.g.state.objects[id]?.zone !== 'battlefield') return;
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: [id], mods: [{ k: 'rule', id: 'rule:regenShield' }] });
  c.g.log(`${nameOf(c.g, id)} recebe um escudo de regeneração.`, { rule: '701.19a' });
}

/** "[permanentes] não podem ser regenerados [neste turno]" (CR 701.19c): os escudos deixam de se aplicar */
export function preventRegeneration(c: C, ids: ObjId[], duration: Duration = { kind: 'endOfTurn' }): void {
  if (ids.length) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration, affected: ids, mods: [{ k: 'rule', id: 'rule:cantBeRegenerated' }] });
}

// ---------------------------------------------------------------------------
// Palavras-chave engatilhadas de criaturas
// ---------------------------------------------------------------------------
/** CR 702.79a: Persistir — quando vai do campo para o cemitério, se não tinha marcadores -1/-1, volta sob o controle do
 *  dono com um marcador -1/-1 (é um objeto novo, ruling 1; ficha não volta, ruling 7) */
function gatilhoPersistir(): TriggeredDef {
  return triggered(on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source && !((c.obj.counters['-1/-1'] ?? 0) > 0) ? { carta: e.obj } : false), function* (c) {
    const carta = c.event.carta as ObjId;
    const o = c.g.state.objects[carta];
    if (!o || o.zone !== 'graveyard') return;
    yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner, counters: { '-1/-1': 1 } }], 'persist');
  }, { text: 'Persistir (quando este permanente morre, se não tinha marcadores -1/-1, devolva-o ao campo sob o controle do dono com um marcador -1/-1).' });
}
export function persist(): TriggeredDef { const a = gatilhoPersistir(); a.kw = 'persist'; return a; }
export const PERSIST = defineAbility('kw:persist', gatilhoPersistir());

/** CR 702.121a e rulings: recebe +1/+1 para cada oponente (jogador, não planeswalker) atacado por uma criatura declarada
 *  atacante neste combate, mesmo que ela já não ataque ou o jogador tenha saído */
function gatilhoCorpoACorpo(): TriggeredDef {
  return triggered(on.selfAttacks(), function* (c) {
    const s = c.g.state;
    const n = (s.combat?.attackedPlayers ?? []).filter((p) => p !== c.you).length;
    if (n > 0 && s.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: n, t: n }]);
  }, { text: 'Corpo a corpo (sempre que esta criatura ataca, ela recebe +1/+1 até o fim do turno para cada oponente que você atacou com uma criatura neste combate).' });
}
/** Corpo a corpo impresso; para conceder ("outras criaturas que você controla têm corpo a corpo"), addKeyword 'melee' */
export function melee(): TriggeredDef { const a = gatilhoCorpoACorpo(); a.kw = 'melee'; return a; }
export const MELEE = defineAbility('kw:melee', gatilhoCorpoACorpo());

/** o jogador tem a maior vida, ou empata com a maior (destronar, CR 702.105a) */
export function hasMostLife(g: G, p: PlayerId): boolean {
  const vida = g.state.players[p].life;
  return g.playersInGame().every((q) => g.state.players[q].life <= vida);
}

/** CR 702.105a: Destronar — sempre que ataca o jogador com mais vida (ou empatado), +1/+1 marcador; confere só ao
 *  disparar (ruling 3), e atacar um planeswalker não conta (ruling 1) */
export function dethrone(): TriggeredDef {
  const a = triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((x) => x.obj === c.source && x.target.kind === 'player' && hasMostLife(c.g, x.target.id))), function* (c) {
    if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
  }, { text: 'Destronar (sempre que esta criatura ataca o jogador com mais vida ou empatado com mais vida, coloque um marcador +1/+1 nela).' });
  a.kw = 'dethrone';
  return a;
}

/** alvos possíveis de quem entra atacando (CR 508.4): os oponentes e os planeswalkers deles */
function alvosDeAtaque(g: G, p: PlayerId): TargetRef[] {
  const out: TargetRef[] = [];
  for (const q of g.opponents(p)) {
    out.push({ kind: 'player', id: q });
    for (const id of g.state.zones.battlefield) if (!g.state.objects[id].phasedOut && controllerOf(g, id) === q && chars(g, id).types.includes('Planeswalker')) out.push({ kind: 'obj', id });
  }
  return out;
}

const SACRIFICA_MOBILIZADAS = defineAbility('kw:mobilize:sacrifica', nextEndStepTrigger(function* (c) {
  const fichas = ((c.data.fichas ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* sacrifice(c.g, fichas);
}, 'Sacrifique as fichas de Guerreiro criadas pela mobilização.'));

/** CR 702.181a: Mobilizar N — sempre que ataca, crie N fichas 1/1 vermelhas de Guerreiro viradas e atacando (cada uma
 *  ataca quem você escolher, ruling 1); sacrifique-as no início da próxima etapa final */
export function mobilize(n: number): TriggeredDef {
  const a = triggered(on.selfAttacks(), function* (c) {
    const s = c.g.state;
    if (!s.combat) return;
    const alvos = alvosDeAtaque(c.g, c.you);
    if (!alvos.length) return;
    const reqs: TargetRef[] = [];
    for (let i = 0; i < n; i++) {
      let alvo = alvos[0];
      if (alvos.length > 1) {
        const itens = alvos.map((x) => (x.kind === 'player' ? playerItem(c.g, x.id) : objItem(c.g, x.id, nameOf(c.g, x.id))));
        const [esc] = yield* chooseItems(c.g, c.you, `Mobilizar ${n}: quem a ficha de Guerreiro ${i + 1} ataca?`, itens, 1, 1);
        alvo = esc.startsWith('p') ? { kind: 'player', id: Number(esc.slice(1)) } : { kind: 'obj', id: Number(esc) };
      }
      reqs.push(alvo);
    }
    const fichas = yield* putOntoBattlefield(c.g, reqs.map((alvo) => ({ controller: c.you, token: { def: 'Warrior vermelho' }, tapped: true, attacking: alvo })), 'token');
    if (fichas.length) delayed(c, SACRIFICA_MOBILIZADAS.id!, { data: { fichas } });
  }, { text: `Mobilizar ${n} (sempre que esta criatura ataca, crie ${n} ficha(s) de criatura Guerreiro vermelha 1/1 virada(s) e atacando; sacrifique-as no início da próxima etapa final).` });
  a.kw = 'mobilize';
  a.param = n;
  return a;
}

// ---------------------------------------------------------------------------
// Sede de sangue (CR 702.54)
// ---------------------------------------------------------------------------
/** dano que os oponentes de `p` (inclusive os que saíram, ruling 7 de Spinerock Knoll) sofreram neste turno: o maior */
export function opponentDamageThisTurn(g: G, p: PlayerId): number {
  return g.state.players.filter((x) => x.id !== p).reduce((m, x) => Math.max(m, g.state.turnStats[x.id]?.damageTaken ?? 0), 0);
}

/** CR 702.54a: Sede de sangue N — se um oponente sofreu dano neste turno, entra com N marcadores +1/+1 */
export function bloodthirst(n: number): ReplacementDef {
  const r = asEnters((c, ev) => {
    if (opponentDamageThisTurn(c.g, ev.controller) > 0) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + n;
  }, `Sede de sangue ${n} (se um oponente sofreu dano neste turno, esta criatura entra com ${n} marcador(es) +1/+1).`);
  r.kw = 'bloodthirst';
  r.param = n;
  return r;
}

/** a mágica ganha sede de sangue N (Bloodlord of Vaasgoth): vale quando ela resolve e o permanente entra; cumulativa
 *  com a impressa (ruling 1) */
defineAbility<StaticDef>('rule:bloodthirstSpell', {
  kind: 'static',
  rules: {
    enterModifier: (c, ev) => {
      const prm = (c as SCtx & { params?: { spell: ObjId; n: number } }).params;
      if (prm && prm.spell === ev.obj && opponentDamageThisTurn(c.g, ev.controller) > 0) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + prm.n;
    },
  },
});
export function grantBloodthirstToSpell(c: C, spell: ObjId, n: number): void {
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: 'rule:bloodthirstSpell', params: { spell, n } }] });
}

// ---------------------------------------------------------------------------
// Monstruosidade (CR 701.37)
// ---------------------------------------------------------------------------
export function isMonstrous(g: G, id: ObjId): boolean {
  return !!g.state.objects[id]?.data.monstrous;
}

/** "Monstruosidade N": se não é monstruoso, põe N marcadores +1/+1 e ele fica monstruoso (designação, não é cópia) */
export function becomeMonstrous(g: G, id: ObjId, n: number, by: PlayerId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.data.monstrous) return false;
  if (n > 0) addCounters(g, { kind: 'obj', id }, '+1/+1', n, by);
  o.data.monstrous = true;
  o.data.monstrousX = n;
  g.bump();
  g.log(`${nameOf(g, id)} fica monstruoso.`, { rule: '701.37a' });
  emit(g, [{ type: 'monstrous', obj: id, n }]);
  return true;
}

/** habilidade ativada "[custo]: Monstruosidade N." */
export function monstrosity(costText: string, n: number): ActivatedDef {
  return activated(costText, function* (c) { becomeMonstrous(c.g, c.source, n, c.you); }, { kw: 'monstrosity', param: n, text: `${costText}: Monstruosidade ${n} (se esta criatura não for monstruosa, coloque ${n} marcador(es) +1/+1 nela e ela fica monstruosa).` });
}

// ---------------------------------------------------------------------------
// Evoluir (CR 702.100)
// ---------------------------------------------------------------------------
function maiorQue(g: G, nova: Chars | null, eu: ObjId): boolean {
  if (!nova || !nova.types.includes('Creature') || !g.state.objects[eu]) return false;
  const me = chars(g, eu);
  return (nova.power ?? 0) > (me.power ?? 0) || (nova.toughness ?? 0) > (me.toughness ?? 0);
}

/** CR 702.100a: Evoluir — sempre que uma criatura sua entra com força ou resistência maior, +1/+1 marcador; compara de
 *  novo ao resolver, com a última informação da criatura se ela saiu (ruling 4) */
export function evolve(): TriggeredDef {
  const a = triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj !== c.source && !!c.g.state.objects[e.obj] && controllerOf(c.g, e.obj) === c.you && maiorQue(c.g, chars(c.g, e.obj), c.source) ? { criatura: e.obj } : false), function* (c) {
    if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
    if (!maiorQue(c.g, lkiChars(c.g, c.event.criatura as ObjId), c.source)) return;
    addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
  }, { text: 'Evoluir (sempre que uma criatura que você controla entra, se ela tiver força ou resistência maior que esta criatura, coloque um marcador +1/+1 nesta criatura).' });
  a.kw = 'evolve';
  return a;
}

// ---------------------------------------------------------------------------
// Confronto (CR 701.30)
// ---------------------------------------------------------------------------
/**
 * "Confronte com um oponente" (CR 701.30b-d): cada um revela a carta do topo ao mesmo tempo; em ordem APNAP decide se ela
 * vai para o fundo; depois as cartas se movem juntas. Vence quem revelou valor de mana maior que todas as outras.
 * Devolve se `p` venceu; os dois recebem o evento 'clash' (gatilhos de "sempre que você vence um confronto").
 */
export function* clash(g: G, p: PlayerId, opponent: PlayerId | null): Gen<boolean> {
  const s = g.state;
  const jogadores = [p, ...(opponent !== null ? [opponent] : [])].filter((x) => !s.players[x].left);
  const reveladas = new Map<PlayerId, ObjId | undefined>(jogadores.map((x) => [x, s.zones.library[x][0]]));
  g.log(`Confronto: ${jogadores.map((x) => `${s.players[x].name} revela ${reveladas.get(x) !== undefined ? nameOf(g, reveladas.get(x)!) : 'nada (grimório vazio)'}`).join('; ')}.`, { rule: '701.30a' });
  const fundo: ObjId[] = [];
  for (const x of g.apnap().filter((y) => jogadores.includes(y))) {
    const id = reveladas.get(x);
    if (id === undefined) continue;
    if (yield* yesNo(g, x, `Confronto: pôr ${nameOf(g, id)} no fundo do grimório? (senão, fica no topo)`, 'Fundo', 'Topo')) fundo.push(id);
  }
  for (const id of fundo) {
    const lib = s.zones.library[s.objects[id].owner];
    const i = lib.indexOf(id);
    if (i >= 0) { lib.splice(i, 1); lib.push(id); }
  }
  g.bump();
  const valor = (x: PlayerId) => { const id = reveladas.get(x); return id === undefined ? null : manaValue(g, id); };
  const venceu = (x: PlayerId) => { const v = valor(x); return v !== null && jogadores.every((y) => y === x || valor(y) === null || (valor(y) as number) < v); };
  emit(g, jogadores.map((x) => ({ type: 'clash' as const, player: x, won: venceu(x) })));
  for (const x of jogadores) if (venceu(x)) g.log(`${s.players[x].name} vence o confronto.`, { rule: '701.30d' });
  return venceu(p);
}

/** "Sempre que você vence um confronto" */
export function onYouWinClash(): TriggerSpec {
  return on.custom((e, c) => e.type === 'clash' && e.player === c.you && e.won);
}

// ---------------------------------------------------------------------------
// Ler adiante (CR 702.155, 714.3b)
// ---------------------------------------------------------------------------
/** Saga com ler adiante: ao entrar, escolha de 1 ao capítulo final; entra com esse número de marcadores de
 *  conhecimento (no lugar do marcador normal da Saga) e, no turno em que entrou, só dispara o capítulo igual ao número
 *  (motor/mecanicas.ts chapter) */
export function readAhead(final: number): AbilityDef[] {
  const r = asEnters(function* (c, ev) {
    const n = yield* chooseNumber(c.g, ev.controller, `Ler adiante: com quantos marcadores de conhecimento esta Saga entra? (de 1 a ${final}; os capítulos pulados não disparam)`, 1, final);
    ev.counters.lore = (ev.counters.lore ?? 0) + n;
    ev.choices.readAheadTurn = c.g.state.turn.number;
  }, `Ler adiante (escolha um capítulo e comece com esse número de marcadores de conhecimento; acrescente um depois da sua etapa de compra; os capítulos pulados não disparam; sacrifique depois do ${final}).`);
  return [keyword('read ahead'), r];
}

// ---------------------------------------------------------------------------
// Polimorfo (CR 702.73)
// ---------------------------------------------------------------------------
/** CR 702.73a: Polimorfo — habilidade que define característica: é de todos os tipos de criatura, em todas as zonas */
export function changeling(): StaticDef {
  return { kind: 'static', kw: 'changeling', cda: true, affects: (c, o) => o.id === c.source, mods: () => [{ k: 'addTypes', subtypes: allCreatureTypes() }], text: 'Polimorfo (esta carta é de todos os tipos de criatura).' };
}

// ---------------------------------------------------------------------------
// Imprimir e esconderijo (CR 607.2a, 702.75)
// ---------------------------------------------------------------------------
/** cartas exiladas com este objeto pela habilidade vinculada `key` que continuam no exílio (CR 607.2a) */
export function linkedExiled(g: G, source: ObjId, key = 'imprint'): ObjId[] {
  const o = g.state.objects[source] ?? g.state.lki[source]?.obj;
  return (o?.linked[key] ?? []).filter((id) => g.state.objects[id]?.zone === 'exile');
}

/** CR 702.75a: Esconderijo N — quando entra, olhe as N cartas do topo, exile uma virada para baixo (o controlador pode
 *  olhá-la) e ponha o resto no fundo em ordem aleatória. A carta fica vinculada ao permanente com a chave 'hideaway' */
export function hideaway(n: number): TriggeredDef {
  const a = triggered(on.selfEnters(), function* (c) {
    const s = c.g.state;
    const topo = s.zones.library[c.you].slice(0, n);
    if (!topo.length) return;
    const itens = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }));
    const [esc] = yield* chooseItems(c.g, c.you, `Esconderijo ${n}: escolha a carta para exilar virada para baixo (as outras vão para o fundo do grimório em ordem aleatória)`, itens, 1, 1);
    const escolhida = Number(esc);
    const [ex] = yield* moveObjects(c.g, [{ id: escolhida, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'hideaway');
    const holder = s.objects[c.source];
    if (ex !== null && ex !== undefined && holder) { holder.linked.hideaway = [ex]; c.g.bump(); }
    const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
    s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
    c.g.bump();
    c.g.log(`${s.players[c.you].name} esconde uma carta (esconderijo ${n}).`, { rule: '702.75a' });
  }, { text: `Esconderijo ${n} (quando entra, olhe as ${n} cartas do topo do seu grimório, exile uma delas virada para baixo e ponha o resto no fundo em ordem aleatória).` });
  a.kw = 'hideaway';
  a.param = n;
  return a;
}

/**
 * "Você pode jogar a carta exilada sem pagar o custo de mana" durante a resolução (Spinerock Knoll): mágica, conjurada
 * de graça (CR 118.9); terreno, jogado como a jogada de terreno do turno, se ainda houver uma (CR 305.3).
 */
export function* mayPlayFree(g: G, p: PlayerId, card: ObjId, prompt: string): Gen<boolean> {
  const o = g.state.objects[card];
  if (!o) return false;
  if (isLand(g, card)) {
    if (g.state.turn.active !== p || g.state.turn.landsPlayed >= 1) return false;
    if (!(yield* yesNo(g, p, prompt))) return false;
    g.state.turn.landsPlayed++;
    g.log(`${g.state.players[p].name} joga ${nameOf(g, card)}.`, { rule: '305.1' });
    yield* putOntoBattlefield(g, [{ id: card, controller: p }], 'play');
    return true;
  }
  return yield* mayCastFree(g, p, card, prompt);
}

// ---------------------------------------------------------------------------
// Reconfigurar (CR 702.151)
// ---------------------------------------------------------------------------
/**
 * CR 702.151a-b: Reconfigurar [custo] — "[custo]: anexe a outra criatura alvo que você controla; só como feitiço" e
 * "[custo]: desanexe; só se estiver anexado a uma criatura e como feitiço". Anexado, deixa de ser criatura e perde os
 * tipos de criatura (ruling 2), até ser desanexado; com isso ele pode equipar (CR 301.5c).
 */
export function reconfigure(costText: string): AbilityDef[] {
  const anexar = activated(costText, function* (c) {
    const alvo = tgt(c);
    if (alvo !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, alvo);
  }, { kw: 'reconfigure', param: costText, timing: 'sorcery', targets: [t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla')], text: `Reconfigurar ${costText}: anexe-o a outra criatura alvo que você controla. Só como feitiço.` });
  const soltar = activated(costText, function* (c) {
    unattach(c.g, c.source);
  }, {
    timing: 'sorcery', text: `Reconfigurar ${costText}: desanexe-o. Só como feitiço e se estiver anexado a uma criatura.`,
    condition: (c) => { const a = c.g.state.objects[c.source]?.attachedTo; return a !== null && a !== undefined && !!c.g.state.objects[a] && isCreature(c.g, a); },
  });
  const naoCriatura: StaticDef = {
    kind: 'static', affects: (c, o) => o.id === c.source && o.attachedTo !== null,
    mods: (c, o) => {
      const ch = chars(c.g, o.id);
      return [{ k: 'setTypes', types: ch.types.filter((x) => x !== 'Creature'), subtypes: ch.subtypes.filter((x) => !allCreatureTypes().includes(x)), keepSupertypes: true }];
    },
    text: 'Enquanto estiver anexado a uma criatura, não é criatura.',
  };
  return [anexar, soltar, naoCriatura];
}

// ---------------------------------------------------------------------------
// Ciclagem de tipo (CR 702.29e) e investigar (CR 701.16)
// ---------------------------------------------------------------------------
const TIPO_PT: Record<string, string> = { Swamp: 'pântano', Island: 'ilha', Plains: 'planície', Mountain: 'montanha', Forest: 'floresta' };

/** "[Tipo]cycling [custo]": [custo], descarte esta carta: procure uma carta do tipo, revele-a, ponha na mão, embaralhe */
export function typecycling(tipo: string, costText: string): ActivatedDef {
  const nome = TIPO_PT[tipo] ?? tipo;
  return activated([...cost(costText), { k: 'discardSelf' }], function* (c) {
    const achadas = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => { const ch = chars(c.g, id); return ch.subtypes.includes(tipo) || ch.types.includes(tipo); }, prompt: `Procure uma carta de ${nome}` });
    if (achadas.length) {
      c.g.log(`${c.g.state.players[c.you].name} revela ${achadas.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
      yield* moveObjects(c.g, achadas.map((id) => ({ id, to: 'hand' as const })), 'search');
    }
    shuffleLibrary(c.g, c.you);
  }, { kw: `${tipo.toLowerCase()}cycling`, param: costText, zones: ['hand'], text: `Ciclagem de ${nome} ${costText} (${costText}, descarte esta carta: procure uma carta de ${nome}, revele-a e ponha na sua mão; depois embaralhe).` });
}

/** CR 701.16a: investigar — crie uma ficha Clue (cartas/fichas.ts) */
export function* investigate(g: G, p: PlayerId, n = 1): Gen<ObjId[]> {
  const ids = yield* createTokens(g, p, 'Clue', n);
  if (ids.length) g.log(`${g.state.players[p].name} investiga.`, { rule: '701.16a' });
  return ids;
}

/** fichas de Sangue (Blood) que o jogador controla (ruling: qualquer ficha de artefato Blood) */
export function bloodTokens(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => !!g.state.objects[id]?.isToken && chars(g, id).types.includes('Artifact') && chars(g, id).subtypes.includes('Blood'));
}

/** a fonte causou dano a este permanente neste turno? (Markov Enforcer) */
export function damagedThisTurnBy(g: G, source: ObjId, target: ObjId): boolean {
  const d = g.state.damagedBy;
  return !!d && d.turn === g.state.turn.number && (d.pairs[String(source)] ?? []).includes(target);
}

// ---------------------------------------------------------------------------
// Bis / encore (CR 702.141)
// ---------------------------------------------------------------------------
const SACRIFICA_BIS = defineAbility('kw:encore:sacrifica', nextEndStepTrigger(function* (c) {
  const fichas = ((c.data.fichas ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* sacrifice(c.g, fichas);
}, 'Sacrifique as fichas criadas pelo bis.'));

// "ataca esse oponente neste turno se puder": a ficha é obrigada a atacar e só pode atacar o oponente dela (se ele
// saiu do jogo, a restrição deixa de valer)
defineAbility<StaticDef>('rule:encore', {
  kind: 'static',
  rules: {
    attacksIfAble: (c, id) => String(id) in (((c as SCtx & { params?: { alvos: Record<string, PlayerId> } }).params)?.alvos ?? {}),
    canAttack: (c, atacante, alvo) => {
      const quem = ((c as SCtx & { params?: { alvos: Record<string, PlayerId> } }).params)?.alvos[String(atacante)];
      if (quem === undefined || c.g.state.players[quem].left) return true;
      const defensor = alvo.kind === 'player' ? alvo.id : controllerOf(c.g, alvo.id);
      return defensor === quem;
    },
  },
});

/**
 * CR 702.141a: Bis [custo] — "[custo], exile esta carta do seu cemitério: para cada oponente, crie uma ficha que é uma
 * cópia desta carta e que ataca esse oponente neste turno se puder. As fichas ganham ímpeto. Sacrifique-as no início
 * da próxima etapa final. Ative somente como feitiço."
 */
export function encore(custo: string): ActivatedDef {
  return activated([{ k: 'mana', cost: custo }, { k: 'exileSelf' }], function* (c) {
    const g = c.g;
    const def = (g.state.objects[c.source] ?? g.state.lki[c.source]?.obj)?.def;
    const oponentes = g.opponents(c.you).filter((p) => !g.state.players[p].left);
    if (!def || !oponentes.length) return;
    const fichas = yield* putOntoBattlefield(g, oponentes.map(() => ({ controller: c.you, token: { copyOf: { def, face: 0 } } })), 'token');
    if (!fichas.length) return;
    const alvos: Record<string, PlayerId> = {};
    fichas.forEach((id, i) => { if (oponentes[i] !== undefined) alvos[String(id)] = oponentes[i]; });
    for (const id of fichas) addEffect(g, { source: id, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: [{ k: 'addKeyword', kw: 'haste' }] });
    addEffect(g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: 'rule:encore', params: { alvos } }] });
    delayed(c, SACRIFICA_BIS.id!, { data: { fichas } });
  }, {
    zones: ['graveyard'], timing: 'sorcery', kw: 'encore', param: custo,
    text: `Bis ${custo} (${custo}, exile esta carta do seu cemitério: para cada oponente, crie uma ficha cópia que ataca esse oponente neste turno se puder; elas ganham ímpeto; sacrifique-as no início da próxima etapa final; ative somente como feitiço)`,
  });
}
