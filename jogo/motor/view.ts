// Vista de um jogador: só o que ele pode ver (CR 400.2, 401.2, 402.3, 406.3, 708).
// O servidor nunca envia o estado inteiro; envia isto.

import { chars, controllerOf, hasKw, hooks } from './chars.ts';
import { combatDamageAmount, damageByToughnessSource } from './combat.ts';
import { summoningSick } from './costs.ts';
import { registry } from './defs.ts';
import type { G } from './game-context.ts';
import { formatCost } from './mana.ts';
import { manaDesfazivel } from './manual.ts';
import { STEP_NAMES } from './turn.ts';
import type { Decision, GameObject, ObjId, PlayerId, Step, TargetRef } from './types.ts';

export interface ObjView {
  id: ObjId;
  /** nome da definição (para a imagem); vazio se o espectador não pode ver */
  def: string;
  name: string;
  face: number;
  owner: PlayerId;
  controller: PlayerId;
  tapped: boolean;
  faceDown: boolean;
  phasedOut: boolean;
  token: boolean;
  copyOfDef?: string;
  counters: Record<string, number>;
  damage: number;
  attachedTo: ObjId | null;
  types: string[];
  subtypes: string[];
  supertypes: string[];
  power: number | null;
  toughness: number | null;
  loyalty: number | null;
  manaCost: string;
  colors: string[];
  keywords: string[];
  abilities: string[];
  commander: boolean;
  sick: boolean;
  prepared: boolean;
  classLevel: number;
  goaded: boolean;
  /** emblema na zona de comando (CR 114): não é carta; mostrar com as habilidades (abilities) */
  emblem?: boolean;
  /** só para a criatura no campo que atribui dano de combate igual à resistência em vez da força (CR 510.1a:
   *  Felothar, Assault Formation…): o dano que ela causa e a carta que dá o efeito; ausente no caso normal */
  damageByToughness?: { amount: number; source: string; sourceDef: string };
  /** virada para mana e essa mana já pagou alguma coisa: o desvirar à mão é recusado (motor/manual.ts manaDesfazivel);
   *  ausente no caso normal */
  manaGasta?: boolean;
}

export interface StackView {
  id: ObjId;
  kind: 'spell' | 'activated' | 'triggered';
  controller: PlayerId;
  name: string;
  def: string;
  text: string;
  targets: string[];
  x: number;
}

export interface PlayerView {
  id: PlayerId;
  name: string;
  life: number;
  counters: Record<string, number>;
  handCount: number;
  libraryCount: number;
  graveyard: ObjView[];
  manaPool: string;
  /** a permanente que gerou cada unidade da reserva, na ordem de manaPool (null: sem permanente) */
  manaSources: (ObjId | null)[];
  commanderDamage: { from: string; amount: number }[];
  commanderTax: number;
  left: boolean;
  lost: boolean;
  won: boolean;
  monarch: boolean;
  mulligans: number;
}

export interface GameView {
  you: PlayerId | null;
  turn: { number: number; active: PlayerId; step: Step; stepName: string };
  priority: PlayerId | null;
  players: PlayerView[];
  turnOrder: PlayerId[];
  battlefield: ObjView[];
  stack: StackView[];
  exile: ObjView[];
  command: ObjView[];
  hand: ObjView[];
  combat: { attackers: { id: ObjId; target: TargetRef; blocked: boolean; blockers: ObjId[] }[] } | null;
  decision: Decision | null;
  waiting: { player: PlayerId; kind: string } | null;
  log: { turn: number; text: string; rule?: string }[];
  gameOver: { winners: PlayerId[]; draw: boolean; reason: string } | null;
}

function canSee(g: G, o: GameObject, viewer: PlayerId | null): boolean {
  if (o.zone === 'library') return o.visibleTo === 'all' || (viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer));
  if (o.zone === 'hand') return viewer === o.owner || o.visibleTo === 'all' || (viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer));
  if (o.faceDown) {
    // CR 708.6: o controlador pode olhar o permanente virado para baixo; no exílio, quem tiver permissão
    if (o.zone === 'battlefield' || o.zone === 'stack') return viewer !== null && (controllerOf(g, o.id) === viewer || (Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer)));
    return viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer);
  }
  return true;
}

/** dano pela resistência (a mesma regra do combate, combat.ts); undefined quando a criatura atribui pela força */
function damageByToughnessView(g: G, id: ObjId): ObjView['damageByToughness'] {
  const src = damageByToughnessSource(g, id);
  if (src === null) return undefined;
  const so = g.state.objects[src] ?? g.state.lki[src]?.obj;
  const source = g.state.objects[src] ? chars(g, src).name : g.state.lki[src]?.chars.name ?? '';
  return { amount: combatDamageAmount(g, id), source, sourceDef: so ? (so.copyOf?.def ?? so.def) : '' };
}

export function objView(g: G, id: ObjId, viewer: PlayerId | null): ObjView {
  const o = g.state.objects[id];
  const visible = canSee(g, o, viewer);
  const c = chars(g, id);
  const abilityTexts: string[] = [];
  const keywords: string[] = [];
  for (const a of c.abilities) {
    if (a.kw) keywords.push(a.kw);
    const d = registry.abilities.get(a.id);
    if (d?.text && !a.kw) abilityTexts.push(d.text);
  }
  const hiddenFaceDown = o.faceDown && !visible;
  // virada para baixo fora do campo e da pilha (exílio: Abstract Performance) não tem características à vista; as do
  // campo e da pilha são as de uma criatura 2/2 incolor sem nome (CR 708.2), que chars já dá e todos podem ver
  const semCaracteristicas = hiddenFaceDown && o.zone !== 'battlefield' && o.zone !== 'stack';
  const byToughness = o.zone === 'battlefield' && !o.phasedOut && c.types.includes('Creature') ? damageByToughnessView(g, id) : undefined;
  return {
    id,
    def: visible ? (o.copyOf?.def ?? o.def) : '',
    name: visible ? (o.faceDown ? `${c.name || 'virada para baixo'}` : c.name) : (o.faceDown ? 'Virada para baixo' : 'Carta oculta'),
    face: visible ? o.face : 0,
    owner: o.owner,
    controller: o.zone === 'battlefield' || o.zone === 'stack' ? controllerOf(g, id) : o.owner,
    tapped: o.tapped,
    faceDown: o.faceDown,
    phasedOut: o.phasedOut,
    token: o.isToken,
    copyOfDef: visible ? o.copyOf?.def : undefined,
    counters: { ...o.counters },
    damage: o.damage,
    attachedTo: o.attachedTo,
    types: semCaracteristicas ? [] : hiddenFaceDown ? ['Creature'] : c.types,
    subtypes: hiddenFaceDown ? [] : c.subtypes,
    supertypes: hiddenFaceDown ? [] : c.supertypes,
    power: semCaracteristicas ? null : c.power,
    toughness: semCaracteristicas ? null : c.toughness,
    loyalty: semCaracteristicas ? null : c.loyalty,
    manaCost: hiddenFaceDown ? '' : (c.manaCost ? formatCost(c.manaCost) : ''),
    colors: semCaracteristicas ? [] : c.colors,
    keywords: hiddenFaceDown ? [] : keywords,
    abilities: hiddenFaceDown ? [] : abilityTexts,
    commander: o.card !== null && !!g.state.cards[o.card]?.isCommander && visible,
    sick: o.zone === 'battlefield' && summoningSick(g, id),
    prepared: o.prepared,
    classLevel: o.classLevel,
    goaded: o.goadedBy.length > 0 || (o.zone === 'battlefield' && hooks(g, 'goads').some((h) => h.fn(h.ctx, id))),
    ...(registry.emblems.has(o.def) ? { emblem: true } : {}),
    ...(byToughness ? { damageByToughness: byToughness } : {}),
    ...(o.manaTap && g.state.config.desvirarSoComMana && !manaDesfazivel(g.state, id) ? { manaGasta: true } : {}),
  };
}

function stackView(g: G, id: ObjId, viewer: PlayerId | null): StackView {
  const o = g.state.objects[id];
  const st = o.stack!;
  const targetName = (t: TargetRef) => (t.kind === 'player' ? g.state.players[t.id].name : g.state.objects[t.id] ? objView(g, t.id, viewer).name : '(já saiu)');
  if (st.kind === 'spell') {
    // mágica virada para baixo (CR 708.4): só o controlador vê qual é
    if (o.faceDown && !canSee(g, o, viewer)) return { id, kind: 'spell', controller: st.controller, name: 'Mágica virada para baixo', def: '', text: '', targets: st.targets.flat().map(targetName), x: st.x };
    const c = chars(g, id);
    return { id, kind: 'spell', controller: st.controller, name: c.name, def: o.copyOf?.def ?? o.def, text: '', targets: st.targets.flat().map(targetName), x: st.x };
  }
  const def = registry.abilities.get(st.abilityId ?? '');
  const src = g.state.objects[st.source ?? -1] ?? g.state.lki[st.source ?? -1]?.obj;
  // fonte virada para baixo (manifestada…) que o espectador não pode ver: nem o nome nem a imagem dela
  if (src?.faceDown && !canSee(g, src, viewer)) return { id, kind: st.kind, controller: st.controller, name: 'Virada para baixo', def: '', text: def?.text ?? '', targets: st.targets.flat().map(targetName), x: st.x };
  const srcName = src ? (g.state.objects[src.id] ? chars(g, src.id).name : g.state.lki[src.id]?.chars.name ?? '') : 'regra do jogo';
  return { id, kind: st.kind, controller: st.controller, name: srcName, def: src?.def ?? '', text: def?.text ?? '', targets: st.targets.flat().map(targetName), x: st.x };
}

export function buildView(g: G, viewer: PlayerId | null, pending: Decision | null): GameView {
  const s = g.state;
  const players: PlayerView[] = s.players.map((p) => ({
    id: p.id, name: p.name, life: p.life, counters: { ...p.counters },
    handCount: s.zones.hand[p.id].length, libraryCount: s.zones.library[p.id].length,
    graveyard: s.zones.graveyard[p.id].map((id) => objView(g, id, viewer)),
    manaPool: p.manaPool.map((u) => `{${u.type}}`).join(''),
    manaSources: p.manaPool.map((u) => u.source),
    commanderDamage: Object.entries(p.commanderDamage).map(([cid, amount]) => ({ from: s.cards[Number(cid)]?.def ?? '?', amount })),
    commanderTax: Object.values(p.commanderCasts).reduce((a, b) => a + b, 0) * 2,
    left: p.left, lost: p.lost, won: p.won, monarch: s.monarch === p.id, mulligans: p.mulligans,
  }));
  const log = s.log.slice(-200).filter((e) => e.visibleTo === null || (viewer !== null && e.visibleTo.includes(viewer)) || e.hiddenText)
    .map((e) => ({ turn: e.turn, text: e.visibleTo === null || (viewer !== null && e.visibleTo.includes(viewer)) ? e.text : e.hiddenText!, rule: e.rule }));
  return {
    you: viewer,
    turn: { number: s.turn.number, active: s.turn.active, step: s.turn.step, stepName: STEP_NAMES[s.turn.step] },
    priority: pending?.kind === 'priority' ? pending.player : null,
    players,
    turnOrder: s.turnOrder,
    battlefield: s.zones.battlefield.map((id) => objView(g, id, viewer)),
    stack: s.zones.stack.map((id) => stackView(g, id, viewer)).reverse(),
    exile: s.zones.exile.map((id) => objView(g, id, viewer)),
    command: s.zones.command.map((id) => objView(g, id, viewer)),
    hand: viewer === null ? [] : s.zones.hand[viewer].map((id) => objView(g, id, viewer)),
    combat: s.combat ? { attackers: s.combat.attackers.filter((a) => !a.removed).map((a) => ({ id: a.id, target: a.target, blocked: a.blocked, blockers: a.blockers })) } : null,
    decision: pending && viewer !== null && pending.player === viewer ? stripDecision(pending) : null,
    waiting: pending ? { player: pending.player, kind: pending.kind } : null,
    log,
    gameOver: s.gameOver,
  };
}

/** remove o validador (função) antes de enviar */
export function stripDecision(d: Decision): Decision {
  const { validate: _v, ...rest } = d as Decision & { validate?: unknown };
  return JSON.parse(JSON.stringify(rest)) as Decision;
}

export { hasKw };
