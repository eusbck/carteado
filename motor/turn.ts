// Estrutura do turno (CR 500-514), prioridade (CR 117) e início da partida (CR 103).
// O laço principal é retomável a partir do estado quando há uma decisão de prioridade
// pendente: tudo antes dela é idempotente (flags no estado).

import { addCounters, draw, discard, untap } from './actions.ts';
import { ask, chooseItems } from './ask.ts';
import { chars, controllerOf, hooks, isType, nameOf } from './chars.ts';
import { combatDamage, declareAttackers, declareBlockers, endCombat, needsFirstStrikeStep, newCombat } from './combat.ts';
import { registry, type Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { legalActions, performAction } from './priority.ts';
import { checkGameEnd, leaveGame, performSBAs } from './sba.ts';
import { putTriggersOnStack, resolveTop } from './stack.ts';
import { emptyTurnStats } from './state.ts';
import { shuffle } from './rng.ts';
import { emit } from './triggers.ts';
import type { Answer, ObjId, PlayerId, Step } from './types.ts';

export const TURN_STEPS: Step[] = ['untap', 'upkeep', 'draw', 'main1', 'beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat', 'main2', 'end', 'cleanup'];
const COMBAT_STEPS: Step[] = ['beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat'];

export const STEP_NAMES: Record<Step, string> = {
  untap: 'desvirar', upkeep: 'manutenção', draw: 'compra', main1: 'primeira fase principal',
  beginCombat: 'início do combate', declareAttackers: 'declarar atacantes', declareBlockers: 'declarar bloqueadores',
  firstStrikeDamage: 'dano de primeiro golpe', combatDamage: 'dano de combate', endCombat: 'fim do combate',
  main2: 'segunda fase principal', end: 'etapa final', cleanup: 'limpeza',
};

// ---------------------------------------------------------------------------
// Início da partida (CR 103.5 mulligan de Londres, 103.5c primeiro grátis em multijogador)
// ---------------------------------------------------------------------------
function* startGame(g: G): Gen<void> {
  const s = g.state;
  const order = s.turnOrder;
  g.log(`Ordem dos assentos: ${order.map((p) => s.players[p].name).join(', ')}. ${s.players[order[0]].name} começa.`, { rule: '103.1' });
  for (const p of order) yield* draw(g, p, 7); // CR 103.5 (não conta como compra de etapa)
  for (const p of order) s.turnStats[p] = emptyTurnStats();
  for (;;) {
    const deciding = order.filter((p) => !s.players[p].kept && !s.players[p].left);
    if (deciding.length === 0) break;
    const mull: PlayerId[] = [];
    for (const p of deciding) {
      const pl = s.players[p];
      // CR 103.5: pode fazer mulligan até a mão inicial chegar a zero cartas
      const free = s.config.multiplayer ? 1 : 0;
      if (7 - Math.max(0, pl.mulligans + 1 - free) < 0) { pl.kept = true; continue; }
      const a = yield* ask<Extract<Answer, { kind: 'mulligan' }>>(g, { kind: 'mulligan', player: p, prompt: pl.mulligans === 0 ? 'Manter a mão inicial ou fazer mulligan?' : 'Manter esta mão ou fazer mulligan de novo?', handSize: s.zones.hand[p].length, mulligans: pl.mulligans });
      if (a.keep) pl.kept = true;
      else mull.push(p);
    }
    for (const p of mull) {
      const pl = s.players[p];
      pl.mulligans++;
      // CR 103.5: embaralha a mão no grimório, compra sete e põe no fundo uma por mulligan
      // (em multijogador o primeiro mulligan não conta, 103.5c)
      for (const id of [...s.zones.hand[p]]) { s.zones.hand[p].splice(s.zones.hand[p].indexOf(id), 1); s.objects[id].zone = 'library'; s.zones.library[p].push(id); }
      shuffle(s.rng, s.zones.library[p]);
      g.bump();
      g.log(`${pl.name} faz mulligan.`, { rule: '103.5' });
      yield* draw(g, p, 7);
      const n = Math.max(0, pl.mulligans - (s.config.multiplayer ? 1 : 0));
      const hand = s.zones.hand[p];
      if (n > 0 && hand.length > 0) {
        const k = Math.min(n, hand.length);
        const ids = yield* chooseItems(g, p, `Escolha ${k} carta(s) para pôr no fundo do grimório`, hand.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: s.objects[id].def } })), k, k, true);
        for (const id of ids.map(Number)) {
          hand.splice(hand.indexOf(id), 1);
          s.objects[id].zone = 'library';
          s.zones.library[p].push(id);
        }
        g.bump();
      }
    }
    for (const p of order) s.turnStats[p] = emptyTurnStats();
  }
  s.started = true;
  beginTurn(g, order[0], true);
}

// ---------------------------------------------------------------------------
// Turnos e etapas
// ---------------------------------------------------------------------------
function beginTurn(g: G, active: PlayerId, first = false): void {
  const s = g.state;
  const prev = s.turn.active;
  if (!first) s.lastTurnAttackedPlayers[prev] = [...s.turnStats[prev].attackedPlayers];
  s.turn = {
    number: s.turn.number + 1, active, step: 'untap', queue: TURN_STEPS.slice(1), stepBegun: false,
    mainPhaseCount: 0, combatCount: 0, landsPlayed: 0,
  };
  s.players[active].lastTurn = s.turn.number;
  s.turnStats = s.players.map(() => emptyTurnStats());
  s.turnCounters = {};
  s.priority = null;
  s.passesInRow = 0;
  // CR 701.15a: goad dura até o próximo turno de quem goadou; idem efeitos "até seu próximo turno"
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (o.goadedBy.length) o.goadedBy = o.goadedBy.filter((x) => x.untilTurnOf !== active);
  }
  s.effects = s.effects.filter((e) => !(e.duration.kind === 'untilYourNextTurn' && e.duration.player === active));
  // CR 103.8a: em partida de dois jogadores, quem começa não compra no primeiro turno
  if (first && !s.config.multiplayer) s.turn.queue = s.turn.queue.filter((x) => x !== 'draw');
  g.bump();
  g.log(`Turno ${s.turn.number}: ${s.players[active].name}.`, { rule: '500.1' });
}

/** etapas que dão prioridade (CR 117.3a, 502.4, 514.3) */
function hasPriority(step: Step): boolean {
  return step !== 'untap' && step !== 'cleanup';
}

function* turnBasedActions(g: G): Gen<void> {
  const s = g.state;
  const t = s.turn;
  const active = t.active;
  const activeIn = !s.players[active].left;
  switch (t.step) {
    case 'untap': {
      if (!activeIn) break;
      // CR 502.1 / 702.26: fase (phasing)
      for (const id of s.zones.battlefield) {
        const o = s.objects[id];
        if (o.phasedOut && o.data.phasedOutBy === active && !o.data.phaseOutUntil) { o.phasedOut = false; delete o.data.phasedOutBy; emit(g, [{ type: 'phaseIn', obj: id }]); }
      }
      // CR 502.3: o ativo desvira seus permanentes (e Seedborn Muse/Drumbellower)
      for (const id of [...s.zones.battlefield]) {
        const o = s.objects[id];
        if (!o || o.phasedOut || !o.tapped) continue;
        const ctrl = controllerOf(g, id);
        let doIt = ctrl === active;
        if (!doIt) doIt = hooks(g, 'untapDuringUntapOf').some((h) => h.fn(h.ctx, id, active));
        if (doIt) untap(g, id);
      }
      emit(g, [{ type: 'step', step: 'untap', active }]);
      break;
    }
    case 'upkeep': emit(g, [{ type: 'step', step: 'upkeep', active }]); break;
    case 'draw':
      if (activeIn) yield* draw(g, active, 1); // CR 504.1
      emit(g, [{ type: 'step', step: 'draw', active }]);
      break;
    case 'main1': case 'main2': {
      t.mainPhaseCount++;
      const firstMain = t.mainPhaseCount === 1;
      // CR 505.4 / 714.3b: marcador de conhecimento nas Sagas na primeira fase principal
      if (firstMain && activeIn) {
        for (const id of [...s.zones.battlefield]) {
          if (!s.objects[id] || s.objects[id].phasedOut) continue;
          if (controllerOf(g, id) === active && chars(g, id).subtypes.includes('Saga') && isType(g, id, 'Enchantment')) addCounters(g, { kind: 'obj', id }, 'lore', 1, active);
        }
      }
      emit(g, [{ type: 'step', step: t.step, active, firstMain }]);
      break;
    }
    case 'beginCombat':
      t.combatCount++;
      s.combat = newCombat(); // CR 802.2: todos os oponentes são defensores
      emit(g, [{ type: 'step', step: 'beginCombat', active }]);
      break;
    case 'declareAttackers':
      if (activeIn) yield* declareAttackers(g);
      emit(g, [{ type: 'step', step: 'declareAttackers', active }]);
      // CR 508.8: sem atacantes, pula bloqueadores e dano
      if (!s.combat || s.combat.attackers.length === 0) t.queue = t.queue.filter((x) => x !== 'declareBlockers' && x !== 'combatDamage' && x !== 'firstStrikeDamage');
      break;
    case 'declareBlockers':
      yield* declareBlockers(g);
      emit(g, [{ type: 'step', step: 'declareBlockers', active }]);
      break;
    case 'combatDamage':
      if (s.combat && !s.combat.firstStrikeStep && needsFirstStrikeStep(g)) {
        // CR 510.4: esta vira a etapa de primeiro golpe; outra etapa de dano vem depois
        t.step = 'firstStrikeDamage';
        s.combat.firstStrikeStep = true;
        t.queue.unshift('combatDamage');
        yield* combatDamage(g, true);
        emit(g, [{ type: 'step', step: 'firstStrikeDamage', active }]);
      } else {
        yield* combatDamage(g, false);
        emit(g, [{ type: 'step', step: 'combatDamage', active }]);
      }
      break;
    case 'endCombat': emit(g, [{ type: 'step', step: 'endCombat', active }]); break;
    case 'end': emit(g, [{ type: 'step', step: 'end', active }]); break;
    case 'cleanup': {
      // CR 514.1: descarta até o tamanho máximo de mão
      if (activeIn) {
        const noMax = hooks(g, 'noMaxHandSize').some((h) => h.fn(h.ctx, active));
        const excess = s.zones.hand[active].length - 7;
        if (!noMax && excess > 0) yield* discard(g, active, excess);
      }
      // CR 514.2: remove dano e encerra efeitos "até o fim do turno"
      for (const id of s.zones.battlefield) { s.objects[id].damage = 0; }
      s.effects = s.effects.filter((e) => e.duration.kind !== 'endOfTurn');
      s.delayedTriggers = s.delayedTriggers.filter((d) => d.expiresTurn === null || d.expiresTurn > s.turn.number);
      for (const p of s.players) p.manaPool = p.manaPool.filter((u) => !u.untilEndOfTurn);
      g.bump();
      break;
    }
    default: break;
  }
}

/** CR 117.5 / 704.3 / 603.3b: ações de estado e gatilhos antes de alguém receber prioridade */
function* checkStateAndTriggers(g: G): Gen<boolean> {
  let any = false;
  for (let guard = 0; guard < 500; guard++) {
    if (g.state.gameOver) return any;
    const did = yield* performSBAs(g);
    if (did) { any = true; continue; }
    if (g.state.pendingTriggers.length) {
      any = true;
      yield* putTriggersOnStack(g);
      continue;
    }
    return any;
  }
  throw new Error('Laço de ações baseadas em estado/gatilhos sem fim');
}

function* priorityLoop(g: G): Gen<void> {
  const s = g.state;
  for (;;) {
    yield* checkStateAndTriggers(g);
    if (g.state.gameOver) return;
    // jogador que saiu: a prioridade passa ao próximo (CR 800.4a, 800.4j)
    let p = g.state.priority ?? g.state.turn.active;
    if (g.state.players[p].left) p = g.nextPlayer(p);
    g.state.priority = p;
    const actions = legalActions(g, p);
    const a = yield* ask<Extract<Answer, { kind: 'priority' }>>(g, { kind: 'priority', player: p, prompt: 'Você tem prioridade', actions });
    if (a.action === 'pass') {
      g.state.passesInRow++;
      if (g.state.passesInRow >= g.playersInGame().length) {
        g.state.passesInRow = 0;
        if (g.state.zones.stack.length === 0) return; // CR 117.4: a etapa termina
        yield* resolveTop(g); // CR 117.4: resolve o topo
        g.state.priority = g.state.turn.active; // CR 117.3b
        if (g.state.players[g.state.priority].left) g.state.priority = g.nextPlayer(g.state.priority);
        continue;
      }
      g.state.priority = g.nextPlayer(p); // CR 117.3d
      continue;
    }
    const did = yield* performAction(g, p, a.action);
    if (did) { g.state.passesInRow = 0; g.state.priority = p; } // CR 117.3c
  }
  void s;
}

function emptyManaPools(g: G): void {
  for (const p of g.state.players) p.manaPool = p.manaPool.filter((u) => u.untilEndOfTurn); // CR 500.5, 106.4
  g.bump();
}

function* runStep(g: G): Gen<void> {
  const s = g.state;
  if (!s.turn.stepBegun) {
    s.turn.stepBegun = true;
    s.priority = s.turn.active;
    s.passesInRow = 0;
    g.bump();
    yield* turnBasedActions(g);
  }
  if (g.state.gameOver) return;
  const step = g.state.turn.step;
  if (hasPriority(step)) {
    yield* priorityLoop(g);
  } else if (step === 'cleanup') {
    // CR 514.3a: se algo acontecer, há prioridade e depois outra limpeza
    const happened = yield* checkStateAndTriggers(g);
    if (happened && !g.state.gameOver) {
      g.state.priority = g.state.turn.active;
      yield* priorityLoop(g);
      if (!g.state.gameOver) g.state.turn.queue.unshift('cleanup');
    }
  }
}

function advance(g: G): void {
  const s = g.state;
  const t = s.turn;
  emptyManaPools(g);
  if (t.step === 'endCombat') endCombat(g);
  const next = t.queue.shift();
  if (next) {
    t.step = next;
    t.stepBegun = false;
    // fase de combate adicional (Aurelia): inserida após o fim do combate por efeitos
    g.bump();
    return;
  }
  // fim do turno
  if (s.config.turnLimit !== null && t.number >= s.config.turnLimit) {
    s.gameOver = { winners: [], draw: true, reason: `limite de ${s.config.turnLimit} turnos` };
    g.log(`A partida termina empatada pelo limite de ${s.config.turnLimit} turnos.`);
    g.bump();
    return;
  }
  const nextPlayer = g.nextPlayer(t.active);
  beginTurn(g, nextPlayer);
}

/** adiciona uma fase de combate depois desta (CR 500.8) */
export function addCombatPhaseAfterCurrent(g: G): void {
  const t = g.state.turn;
  const idx = t.queue.indexOf('main2');
  const insertAt = idx >= 0 ? idx : 0;
  t.queue.splice(insertAt, 0, ...COMBAT_STEPS);
  g.bump();
}

export function* mainLoop(g: G): Gen<void> {
  if (!g.state.started) yield* startGame(g);
  while (!g.state.gameOver) {
    yield* runStep(g);
    if (g.state.gameOver) break;
    advance(g);
  }
  checkGameEnd(g);
}

/** concessão (CR 104.3a): o jogador sai imediatamente */
export function concede(g: G, p: PlayerId): void {
  const pl = g.state.players[p];
  if (pl.left) return;
  pl.conceded = true;
  pl.lost = true;
  g.log(`${pl.name} concede a partida.`, { rule: '104.3a' });
  leaveGame(g, p);
  checkGameEnd(g);
}

export { registry, type ObjId };
