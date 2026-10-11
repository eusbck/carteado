// Jeitos de conjurar e custos (lote 2): morph, ninjutsu e ninjutsu de comandante, sneak, loucura (madness), mayhem,
// ricochete (rebound), retraçar (retrace), recompra (buyback), cascata, sobrecarga (overload), escalada, baixa
// (casualty), espetáculo, multikicker, esquadrão (squad) e contemplar (behold). Cada um cita a regra conferida em
// fontes-oficiais/MagicCompRules-2026-09-25.txt.
//
// Onde o motor faz a parte dele (para quem for mexer):
//  - stack.ts castInner/resolveTop: conjurar virada para baixo, X do custo alternativo, escalada, entrar atacando
//    (sneak), recompra e ricochete na resolução; faceDefOf sem texto para o que está virado para baixo.
//  - actions.ts moveObjects: o descarte de uma carta com loucura vai para o exílio e dispara 'kw:madness'; todo descarte
//    marca data.discardedTurn (mayhem).
//  - costs.ts: as partes de custo 'returnUnblockedAttacker' (ninjutsu, sneak) e 'revealSelf'.
//  - priority.ts: as opções extras (castOptionsExtra), a checagem da conjuração virada para baixo (canStartFaceDown), o
//    tempo próprio de um custo alternativo (sneak), habilidades da zona de comando e a ação especial de desvirar o morph.

import { createTokens, moveObjects, putOntoBattlefield } from './actions.ts';
import { chooseItems, objItem, yesNo } from './ask.ts';
import { chars, controllerOf, hooks, isCreature, isLand, manaValue, nameOf, power, printedChars } from './chars.ts';
import { canAfford, payMana } from './costs.ts';
import { defineAbility, type ActivatedDef, type AdditionalCostDef, type AltCastDef, type CostPart, type Ctx, type Gen, type SCtx, type StaticDef, type TriggeredDef } from './defs.ts';
import { activated, on, triggered } from './dsl.ts';
import type { G } from './game-context.ts';
import { formatCost, parseCost } from './mana.ts';
import { copiableValues, mayCastFree, timesPaid } from './mecanicas.ts';
import { shuffle } from './rng.ts';
import { castSpell, copySpell, faceDefOf, totalSpellCost, type CastMethod } from './stack.ts';
import { emit } from './triggers.ts';
import type { GameObject, ManaSymbol, ObjId, PlayerId, TargetRef, ZoneName } from './types.ts';

/** tempo de feitiço (CR 307.5): fase principal do próprio turno, pilha vazia */
function tempoDeFeitico(g: G, p: PlayerId): boolean {
  const t = g.state.turn;
  return (t.step === 'main1' || t.step === 'main2') && t.active === p && g.state.zones.stack.length === 0;
}

/** o comandante deste jogador na zona de comando (CR 903.8: pode ser conjurado de lá) */
function comandanteDe(g: G, p: PlayerId, o: GameObject): boolean {
  return o.zone === 'command' && o.owner === p && o.card !== null && !!g.state.cards[o.card]?.isCommander;
}

/** o atacante devolvido ainda é um alvo de ataque válido? (CR 506.3c: jogador no jogo, permanente no campo) */
function alvoDeAtaqueValido(g: G, quem: PlayerId, alvo: TargetRef | null | undefined): alvo is TargetRef {
  if (!alvo || !g.state.combat || g.state.turn.active !== quem) return false;
  return alvo.kind === 'player' ? !g.state.players[alvo.id].left : g.state.objects[alvo.id]?.zone === 'battlefield';
}

// ---------------------------------------------------------------------------
// Morph (CR 702.37, 708)
// ---------------------------------------------------------------------------
/** o custo alternativo do morph: {3}, conjurada virada para baixo (CR 702.37a, 702.37c) */
export const MORPH_ALT: AltCastDef = { key: 'morph', label: 'Conjurar virada para baixo (metamorfose) por {3}', zone: 'hand', mana: '{3}', faceDown: true };

/**
 * Morph [custo] (CR 702.37a): pode conjurar a carta virada para baixo como criatura 2/2 sem nome, texto, subtipos nem
 * custo de mana pagando {3}; com prioridade, quem a controla pode virá-la para cima pagando o custo de morph (ação
 * especial, 702.37e). Funciona de qualquer zona de onde se conjuraria a carta (mão, ou a zona de comando).
 */
export function morph(custo: string): StaticDef {
  return { kind: 'static', kw: 'morph', param: custo, text: `Metamorfose ${custo} (você pode conjurar esta carta virada para baixo como uma criatura 2/2 por {3}; vire-a para cima a qualquer momento pagando o custo de metamorfose)` };
}

/** custo de morph da carta (o impresso, mesmo virada para baixo: CR 702.37e "se estivesse virada para cima") */
export function morphCost(g: G, id: ObjId): string | null {
  const o = g.state.objects[id];
  if (!o) return null;
  const abil = o.faceDown ? printedChars(o.copyOf?.def ?? o.def, 0, o.owner).abilities : chars(g, id).abilities;
  const k = abil.find((a) => a.kw === 'morph');
  return typeof k?.param === 'string' ? k.param : null;
}

/** custo para virar para cima pelo morph a permanente virada para baixo que o jogador controla (CR 702.37e); null se não dá */
export function morphFaceUpCost(g: G, id: ObjId): ManaSymbol[] | null {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || !o.faceDown) return null;
  const custo = morphCost(g, id);
  return custo === null ? null : parseCost(custo);
}

/**
 * Ação especial de virar para cima pelo morph (CR 116.2b, 702.37e): mostra o custo, paga e vira. Não usa a pilha, não é
 * "entrar no campo" (708.8: gatilhos de entrar não disparam) e os efeitos que já se aplicavam continuam.
 */
export function* turnFaceUpMorph(g: G, p: PlayerId, id: ObjId): Gen<boolean> {
  const custo = morphFaceUpCost(g, id);
  if (custo === null || controllerOf(g, id) !== p) return false;
  const o0 = g.state.objects[id];
  const nome = printedChars(o0.copyOf?.def ?? o0.def, 0, o0.owner).name;
  const pago = yield* payMana(g, p, custo, { purpose: { kind: 'effect' }, canCancel: true, label: `virar ${nome} para cima (metamorfose)` });
  if (pago === null) return false;
  const o = g.state.objects[id];
  if (!o || !o.faceDown) return false;
  o.faceDown = false;
  delete o.data.manifestada;
  g.bump();
  g.log(`${g.state.players[p].name} paga a metamorfose ${formatCost(custo)} e vira para cima ${nome}.`, { rule: '702.37e' });
  emit(g, [{ type: 'turnedFaceUp', obj: id }]);
  return true;
}

/**
 * Conjurar virada para baixo: dá para começar? (CR 601.3, 708.4) A mágica é uma criatura 2/2 sem habilidades: tempo de
 * feitiço (a menos que algo permita como lampejo), sem alvos nem custos adicionais; paga {3} (mais o imposto, da zona de
 * comando).
 */
export function canStartFaceDown(g: G, p: PlayerId, opt: { obj: ObjId; method: CastMethod }): boolean {
  if (!tempoDeFeitico(g, p) && !hooks(g, 'castAsThoughFlash').some((h) => h.fn(h.ctx, p, opt.obj))) return false;
  if (hooks(g, 'cantCastSpells').some((h) => h.fn(h.ctx, p))) return false;
  const o = g.state.objects[opt.obj];
  const cost = totalSpellCost(g, p, o, opt.method, { x: 0, targets: [], paid: {} });
  return canAfford(g, p, cost, { purpose: { kind: 'spell', obj: opt.obj } });
}

/**
 * Opções de conjurar que o laço comum de priority.ts não monta: morph (também para um terreno com morph, como Zoetic
 * Cavern, e do comandante na zona de comando) e os custos alternativos com fromCommandZone (sneak do comandante).
 */
export function castOptionsExtra(g: G, p: PlayerId, id: ObjId, zone: ZoneName): { obj: ObjId; method: CastMethod }[] {
  const o = g.state.objects[id];
  if (!o) return [];
  const out: { obj: ObjId; method: CastMethod }[] = [];
  const comandante = zone === 'command' && comandanteDe(g, p, o);
  if ((zone === 'hand' && o.owner === p) || comandante) {
    if (morphCost(g, id) !== null) out.push({ obj: id, method: { key: 'morph', label: MORPH_ALT.label, zone, alt: { ...MORPH_ALT, zone } } });
  }
  if (comandante) {
    for (const alt of faceDefOf(o)?.altCosts ?? []) {
      if (alt.fromCommandZone && (!alt.condition || alt.condition({ g, you: p, source: id }))) out.push({ obj: id, method: { key: alt.key, label: alt.label, zone, alt: { ...alt, zone } } });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Ninjutsu (CR 702.49)
// ---------------------------------------------------------------------------
/**
 * Ninjutsu [custo] (CR 702.49a): "[Custo], revele esta carta da mão, devolva à mão do dono um atacante não bloqueado
 * que você controla: ponha esta carta no campo virada e atacando". Entra atacando o mesmo jogador, planeswalker ou
 * batalha do devolvido (702.49c), não bloqueada (506.3d) e sem ter sido declarada atacante. Com `commander`, é o
 * ninjutsu de comandante (702.49d): funciona também da zona de comando (sem imposto: não é conjurar).
 */
export function ninjutsu(custo: string, opts: { commander?: boolean } = {}): ActivatedDef {
  const zonas: ZoneName[] = opts.commander ? ['hand', 'command'] : ['hand'];
  const nome = opts.commander ? 'Ninjutsu de comandante' : 'Ninjutsu';
  return activated([{ k: 'mana', cost: custo }, { k: 'revealSelf' }, { k: 'returnUnblockedAttacker' }], function* (c) {
    const o = c.g.state.objects[c.source];
    // ruling: se a carta não está mais na mão (ou na zona de comando), não entra
    if (!o || !zonas.includes(o.zone)) return;
    const devolvido = (c.data.costInfo as { returnedAttacker?: { target: TargetRef | null } } | undefined)?.returnedAttacker;
    const alvo = devolvido?.target;
    const [novo] = yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true, attacking: alvoDeAtaqueValido(c.g, c.you, alvo) ? alvo : undefined }], 'ninjutsu');
    if (novo !== undefined) c.g.log(`${nameOf(c.g, novo)} entra no campo virada e atacando (${nome.toLowerCase()}).`, { rule: opts.commander ? '702.49d' : '702.49a' });
  }, {
    zones: zonas, kw: opts.commander ? 'commander ninjutsu' : 'ninjutsu', param: custo,
    text: `${nome} ${custo} (${custo}, devolva à mão um atacante não bloqueado que você controla: ponha esta carta no campo ${opts.commander ? 'vinda da sua mão ou da zona de comando, ' : ''}virada e atacando)`,
  });
}

// ---------------------------------------------------------------------------
// Sneak (CR 702.190)
// ---------------------------------------------------------------------------
/**
 * Sneak [custo] (CR 702.190a): a qualquer momento em que poderia conjurar uma instantânea na sua etapa de declarar
 * bloqueadores, conjura pagando [custo] e devolvendo à mão uma criatura não bloqueada que controla em vez do custo de
 * mana. A permanente entra virada e atacando quem a devolvida atacava (702.190b). Ponha `altCost` em altCosts e
 * `ability` em abilities (mostra a palavra-chave).
 */
export function sneak(custo: string): { altCost: AltCastDef; ability: StaticDef } {
  return {
    altCost: {
      key: 'sneak', label: `Conjurar com sneak ${custo}`, zone: 'hand', mana: custo,
      parts: [{ k: 'returnUnblockedAttacker', label: 'uma criatura não bloqueada que você controla' }],
      timing: (c) => c.g.state.turn.step === 'declareBlockers' && c.g.state.turn.active === c.you,
      fromCommandZone: true, enterAttacking: true,
    },
    ability: { kind: 'static', kw: 'sneak', param: custo, text: `Sneak ${custo} (na sua etapa de declarar bloqueadores, você pode conjurar esta mágica pagando ${custo} e devolvendo à mão uma criatura não bloqueada que você controla; ela entra virada e atacando)` },
  };
}

/** a mágica (ou o permanente que ela virou) foi conjurada pelo sneak? */
export function sneakPaid(c: { method?: string } | GameObject | null | undefined): boolean {
  if (!c) return false;
  if ('method' in c && c.method !== undefined) return c.method === 'sneak';
  const o = c as GameObject;
  return o.stack?.method === 'sneak' || (o.data?.spell as { method?: string } | undefined)?.method === 'sneak';
}

// ---------------------------------------------------------------------------
// Loucura / madness (CR 702.35)
// ---------------------------------------------------------------------------
function textoLoucura(mana: string, life: number): string {
  return life ? `${mana} e pagar ${life} de vida` : mana;
}

/**
 * Madness [custo] (CR 702.35a): descartada, vai para o exílio em vez do cemitério (actions.ts) e dispara: o dono pode
 * conjurá-la pagando [custo] em vez do custo de mana; se não conjurar, ela vai para o cemitério. `life`: "Madness—{2}{B},
 * Pay 8 life". Uma estática que conceda loucura pode usar { k: 'addKeyword', kw: 'madness', param: { mana, life } }.
 */
export function madness(custo: string, opts: { life?: number } = {}): StaticDef {
  const life = opts.life ?? 0;
  return { kind: 'static', kw: 'madness', param: { mana: custo, life }, text: `Loucura ${textoLoucura(custo, life)} (se você descartar esta carta, descarte-a no exílio; quando fizer isso, conjure-a pelo custo de loucura ou ponha-a no cemitério)` };
}

/** o gatilho da loucura (CR 702.35a): posto pendente por actions.ts quando o descarte vai para o exílio */
export const MADNESS_TRIGGER = defineAbility('kw:madness', triggered({ kind: 'event', match: () => false }, function* (c) {
  const id = c.source;
  const o = c.g.state.objects[id];
  // a carta saiu do exílio antes da resolução: já é outro objeto (CR 400.7)
  if (!o || o.zone !== 'exile') return;
  const prm = c.event.madness as { mana: string; life?: number };
  const quem = o.owner;
  const nome = nameOf(c.g, id);
  let conjurou = false;
  if (!isLand(c.g, id) && (yield* yesNo(c.g, quem, `Loucura: conjurar ${nome} por ${textoLoucura(prm.mana, prm.life ?? 0)}? (senão, ela vai para o cemitério)`))) {
    const parts: CostPart[] = prm.life ? [{ k: 'life', n: prm.life }] : [];
    const alt: AltCastDef = { key: 'madness', label: `Conjurar com loucura ${prm.mana}`, zone: 'exile', mana: prm.mana, parts };
    // conjurada durante a resolução do gatilho: ignora o tempo de feitiço (CR 608.2g)
    conjurou = (yield* castSpell(c.g, quem, id, { key: 'madness', label: alt.label, zone: 'exile', alt, duringResolution: true })) !== null;
  }
  if (!conjurou && c.g.state.objects[id]?.zone === 'exile') {
    yield* moveObjects(c.g, [{ id, to: 'graveyard' }], 'madness');
    c.g.log(`${nome} vai do exílio para o cemitério (loucura não conjurada).`, { rule: '702.35a' });
  }
}, { text: 'Loucura: quando esta carta é exilada pela loucura, o dono pode conjurá-la pelo custo de loucura; se não conjurar, ela vai para o cemitério.' }));

/** a mágica foi conjurada pelo custo de loucura? (Avacyn's Judgment: "se o custo de loucura foi pago") */
export function madnessPaid(c: { method?: string }): boolean {
  return c.method === 'madness';
}

// ---------------------------------------------------------------------------
// Mayhem (CR 702.187)
// ---------------------------------------------------------------------------
/** a carta foi descartada neste turno e está no cemitério desde então (CR 702.187b) */
export function discardedThisTurn(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'graveyard' && o.data.discardedTurn === g.state.turn.number;
}

/**
 * Mayhem [custo] (CR 702.187b): enquanto você tiver descartado esta carta neste turno, pode conjurá-la do cemitério
 * pagando [custo] em vez do custo de mana. As regras de tempo continuam valendo.
 */
export function mayhem(custo: string): { altCost: AltCastDef; ability: StaticDef } {
  return {
    altCost: { key: 'mayhem', label: `Conjurar do cemitério com mayhem ${custo}`, zone: 'graveyard', mana: custo, condition: (c) => discardedThisTurn(c.g, c.source) },
    ability: { kind: 'static', kw: 'mayhem', param: custo, zones: ['graveyard'], text: `Mayhem ${custo} (você pode conjurar esta carta do seu cemitério por ${custo} se a descartou neste turno; as regras de tempo continuam valendo)` },
  };
}

// ---------------------------------------------------------------------------
// Ricochete / rebound (CR 702.88)
// ---------------------------------------------------------------------------
/**
 * Rebound (CR 702.88a): conjurada da mão, ao resolver vai para o exílio em vez do cemitério (stack.ts) e, no início da
 * sua próxima manutenção, você pode conjurá-la do exílio sem pagar o custo de mana. Várias instâncias são redundantes.
 */
export function rebound(): StaticDef {
  return { kind: 'static', kw: 'rebound', text: 'Ricochete (se você conjurar esta mágica da sua mão, exile-a ao resolver; no início da sua próxima manutenção, você pode conjurá-la do exílio sem pagar o custo de mana)' };
}

/** o gatilho atrasado do ricochete (posto por stack.ts) */
export const REBOUND_TRIGGER = defineAbility('kw:rebound', triggered({
  kind: 'event',
  match: (e, c) => {
    if (e.type !== 'step' || e.step !== 'upkeep' || e.active !== c.you) return false;
    const d = (c as unknown as { delayed?: { createdTurn: number } }).delayed;
    return !d || c.g.state.turn.number > d.createdTurn;
  },
}, function* (c) {
  const id = c.source;
  if (c.g.state.objects[id]?.zone !== 'exile') return;
  // conjurada pelo efeito do ricochete: custo alternativo "sem pagar o custo de mana" (CR 702.88b)
  yield* mayCastFree(c.g, c.you, id, `Ricochete: conjurar ${nameOf(c.g, id)} do exílio sem pagar o custo de mana?`);
}, { text: 'Ricochete: no início da sua próxima manutenção, você pode conjurar esta carta do exílio sem pagar o custo de mana.' }));

// ---------------------------------------------------------------------------
// Retraçar / retrace (CR 702.81)
// ---------------------------------------------------------------------------
/**
 * Retrace (CR 702.81a): pode conjurar esta carta do cemitério descartando um card de terreno como custo adicional (paga
 * o custo de mana normal). Ponha `altCost` em altCosts e `ability` em abilities.
 */
export function retrace(): { altCost: AltCastDef; ability: StaticDef } {
  return {
    altCost: {
      key: 'retrace', label: 'Conjurar do cemitério com retraçar (descartando um terreno)', zone: 'graveyard', mana: null, useManaCost: true,
      parts: [{ k: 'discard', n: 1, filter: (c, id) => isLand(c.g, id), label: 'uma carta de terreno' }],
    },
    ability: { kind: 'static', kw: 'retrace', zones: ['graveyard'], text: 'Retraçar (você pode conjurar esta carta do seu cemitério descartando uma carta de terreno além de pagar os outros custos)' },
  };
}

// ---------------------------------------------------------------------------
// Recompra / buyback (CR 702.27)
// ---------------------------------------------------------------------------
/**
 * Buyback [custo] (CR 702.27a): custo adicional opcional; se foi pago, ao resolver a mágica vai para a mão do dono em
 * vez do cemitério (stack.ts). Vai em additionalCosts.
 */
export function buyback(custo: string): AdditionalCostDef {
  return { key: 'buyback', label: `recompra ${custo}`, parts: [{ k: 'mana', cost: custo }], optional: true };
}

// ---------------------------------------------------------------------------
// Cascata (CR 702.85)
// ---------------------------------------------------------------------------
/**
 * Cascade (CR 702.85a): quando você conjura esta mágica, exile cartas do topo do grimório até exilar uma carta que não
 * seja terreno com valor de mana menor que o desta mágica; você pode conjurá-la sem pagar o custo de mana se o valor de
 * mana da mágica resultante for menor; depois as exiladas que não foram conjuradas vão para o fundo em ordem aleatória.
 * Cada instância dispara separadamente (702.85c).
 */
export function cascade(): TriggeredDef {
  const a = triggered(on.custom((e, c) => (e.type === 'cast' && e.obj === c.source ? { spell: e.obj } : false)), function* (c) {
    const g = c.g;
    const s = g.state;
    const spell = c.event.spell as ObjId;
    // o valor de mana desta mágica, mesmo que ela já tenha saído da pilha (última informação conhecida)
    const mv = s.objects[spell]?.zone === 'stack' ? chars(g, spell).manaValue : (s.lki[spell]?.chars.manaValue ?? 0);
    const lib = s.zones.library[c.you];
    const i = lib.findIndex((id) => !isLand(g, id) && manaValue(g, id) < mv);
    const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
    if (!tiradas.length) return;
    g.log(`Cascata de ${s.lki[spell]?.chars.name ?? nameOf(g, spell)}: ${s.players[c.you].name} exila ${tiradas.map((id) => nameOf(g, id)).join(', ')}.`, { rule: '702.85a' });
    const novos = (yield* moveObjects(g, tiradas.map((id) => ({ id, to: 'exile' as const })), 'cascade')).filter((x): x is ObjId => x !== null);
    const achada = i < 0 ? null : novos[novos.length - 1] ?? null;
    if (achada !== null && g.state.objects[achada]?.zone === 'exile' && manaValue(g, achada) < mv) {
      yield* mayCastFree(g, c.you, achada, `Cascata: conjurar ${nameOf(g, achada)} sem pagar o custo de mana?`);
    }
    const resto = shuffle(s.rng, novos.filter((id) => g.state.objects[id]?.zone === 'exile'));
    if (resto.length) yield* moveObjects(g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'cascade');
  }, { zones: ['stack'], text: 'Cascata (quando você conjura esta mágica, exile cartas do topo do seu grimório até exilar uma que não seja terreno e custe menos; você pode conjurá-la sem pagar o custo de mana; ponha as exiladas no fundo em ordem aleatória)' });
  a.kw = 'cascade';
  return a;
}

// ---------------------------------------------------------------------------
// Sobrecarga / overload (CR 702.96)
// ---------------------------------------------------------------------------
/**
 * Overload [custo] (CR 702.96a-b): custo alternativo; pago, "alvo" vira "cada" e a mágica não tem alvos. O efeito da
 * carta trata os dois casos: `if (overloaded(c)) { cada … } else { tgt(c) … }`. Vai em altCosts.
 */
export function overload(custo: string): AltCastDef {
  return { key: 'overload', label: `Conjurar com sobrecarga ${custo}`, zone: 'hand', mana: custo, noTargets: true };
}

/** a mágica foi conjurada pela sobrecarga? */
export function overloaded(c: { method?: string }): boolean {
  return c.method === 'overload';
}

// ---------------------------------------------------------------------------
// Escalada (CR 702.120)
// ---------------------------------------------------------------------------
/**
 * Escalate [custo] (CR 702.120a): para cada modo escolhido além do primeiro, paga [custo] a mais. Vai em
 * additionalCosts; o motor conta os modos sozinho (perExtraMode).
 */
export function escalate(parts: CostPart[], label: string): AdditionalCostDef {
  return { key: 'escalate', label: `escalada — ${label}`, parts, optional: true, perExtraMode: true };
}

// ---------------------------------------------------------------------------
// Baixa / casualty (CR 702.153)
// ---------------------------------------------------------------------------
/**
 * Casualty N (CR 702.153a): custo adicional opcional de sacrificar uma criatura com força N ou mais; quando você conjura
 * a mágica, se o custo foi pago, copie-a (a cópia pode ter novos alvos). `cost` vai em additionalCosts e `trigger` em
 * abilities.
 */
export function casualty(n: number): { cost: AdditionalCostDef; trigger: TriggeredDef } {
  const trigger = triggered(on.custom((e, c) => (e.type === 'cast' && e.obj === c.source ? { spell: e.obj } : false)), function* (c) {
    yield* copySpell(c.g, c.source, c.you, { newTargets: true });
  }, {
    zones: ['stack'],
    // cláusula "se" interveniente (CR 603.4): só se o custo foi pago
    condition: (c) => timesPaid(c.g, c.source, 'casualty') > 0,
    text: `Baixa ${n} (ao conjurar esta mágica, você pode sacrificar uma criatura com força ${n} ou mais; quando fizer isso, copie esta mágica)`,
  });
  trigger.kw = 'casualty';
  trigger.param = n;
  return {
    cost: {
      key: 'casualty', label: `baixa ${n} (sacrifique uma criatura com força ${n} ou mais)`, optional: true,
      parts: [{ k: 'sacrifice', n: 1, filter: (c, id) => isCreature(c.g, id) && power(c.g, id) >= n, label: `uma criatura com força ${n} ou mais` }],
    },
    trigger,
  };
}

// ---------------------------------------------------------------------------
// Espetáculo / spectacle (CR 702.137)
// ---------------------------------------------------------------------------
/** um oponente de `p` perdeu vida neste turno? */
export function opponentLostLifeThisTurn(g: G, p: PlayerId): boolean {
  return g.opponents(p).some((op) => (g.state.turnStats[op]?.lifeLost ?? 0) > 0);
}

/** Spectacle [custo] (CR 702.137a): pode pagar [custo] em vez do custo de mana se um oponente perdeu vida neste turno */
export function spectacle(custo: string): AltCastDef {
  return { key: 'spectacle', label: `Conjurar com espetáculo ${custo}`, zone: 'hand', mana: custo, condition: (c) => opponentLostLifeThisTurn(c.g, c.you) };
}

// ---------------------------------------------------------------------------
// Multikicker (CR 702.33c)
// ---------------------------------------------------------------------------
/** Multikicker [custo] (CR 702.33c): custo adicional que se paga quantas vezes quiser; vai em additionalCosts */
export function multikicker(custo: string): AdditionalCostDef {
  return { key: 'multikicker', label: `multikicker ${custo}`, parts: [{ k: 'mana', cost: custo }], optional: true, repeatable: true, capByMana: true };
}

/** quantas vezes um custo repetível foi pago: na mágica (pilha ou última informação) ou no permanente que ela virou */
export function paidTimes(g: G, id: ObjId, key: string): number {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  if (!o) return 0;
  const paid = o.stack?.paid ?? (o.data.spell as { paid?: Record<string, number | boolean> } | undefined)?.paid ?? {};
  const v = paid[key];
  return typeof v === 'number' ? v : v ? 1 : 0;
}

/** quantas vezes a mágica ou o permanente teve o multikicker pago (CR 702.33d) */
export function kickedTimes(g: G, id: ObjId): number {
  return paidTimes(g, id, 'multikicker');
}

// ---------------------------------------------------------------------------
// Esquadrão / squad (CR 702.157)
// ---------------------------------------------------------------------------
/**
 * Squad [custo] (CR 702.157a): custo adicional que se paga quantas vezes quiser; quando entra, se o custo foi pago, crie
 * uma ficha que é cópia dele para cada vez (última informação, se já saiu). `cost` vai em additionalCosts e `trigger`
 * em abilities.
 */
export function squad(custo: string): { cost: AdditionalCostDef; trigger: TriggeredDef } {
  const trigger = triggered(on.selfEnters(), function* (c) {
    const n = paidTimes(c.g, c.source, 'squad');
    if (n > 0) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, n);
  }, {
    condition: (c) => paidTimes(c.g, c.source, 'squad') > 0,
    text: `Esquadrão ${custo} (ao conjurar, você pode pagar ${custo} quantas vezes quiser; quando este permanente entra, crie uma ficha que é cópia dele para cada vez)`,
  });
  trigger.kw = 'squad';
  trigger.param = custo;
  return { cost: { key: 'squad', label: `esquadrão ${custo}`, parts: [{ k: 'mana', cost: custo }], optional: true, repeatable: true, capByMana: true }, trigger };
}

// ---------------------------------------------------------------------------
// Contemplar / behold (CR 701.4)
// ---------------------------------------------------------------------------
/**
 * "Behold a [qualidade]" (CR 701.4a): revele uma carta com a qualidade da mão ou escolha um permanente com a qualidade
 * que você controla. `optional` para "you may behold". Devolve o que foi contemplado (701.4b: a qualidade conta no
 * momento da ação) ou null.
 */
export function* behold(c: Ctx | (SCtx & { you: PlayerId }), quality: (id: ObjId) => boolean, label: string, opts: { optional?: boolean } = {}): Gen<{ id: ObjId; from: 'battlefield' | 'hand' } | null> {
  const g = c.g;
  const s = g.state;
  const p = c.you;
  const campo = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p && quality(id));
  const mao = s.zones.hand[p].filter((id) => quality(id));
  if (!campo.length && !mao.length) return null;
  const itens = [
    ...campo.map((id) => objItem(g, id, `${nameOf(g, id)} (no campo)`)),
    ...mao.map((id) => ({ ...objItem(g, id, `${nameOf(g, id)} (revelar da mão)`), card: { def: s.objects[id].def } })),
  ];
  const esc = yield* chooseItems(g, p, `Contemplar ${label}: escolha ${label} que você controla ou revele uma carta da sua mão${opts.optional ? ' (ou nenhuma)' : ''}`, itens, opts.optional ? 0 : 1, 1);
  if (!esc.length) return null;
  const id = Number(esc[0]);
  const from = campo.includes(id) ? 'battlefield' : 'hand';
  g.log(`${s.players[p].name} contempla ${nameOf(g, id)}${from === 'hand' ? ' (revelada da mão)' : ''}.`, { rule: '701.4a' });
  return { id, from };
}
