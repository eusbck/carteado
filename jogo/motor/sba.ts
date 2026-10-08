// Ações baseadas em estado (CR 704) e saída de jogadores da partida (CR 800.4).

import { moveObjects, removeFromCombat } from './actions.ts';
import { chooseItems, objItem, yesNo } from './ask.ts';
import { chars, controllerOf, hasKw, isBestowed, isCreature, nameOf } from './chars.ts';
import { registry, type Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { destroyObject } from './state.ts';
import { enchantCandidates } from './actions.ts';
import { protectionBlocksEquip } from './actions.ts';
import { cantLoseGame } from './veneno-emblema.ts';
import { emit } from './triggers.ts';
import type { ObjId, PlayerId, ZoneName } from './types.ts';

/** executa uma rodada de ações baseadas em estado; devolve true se alguma foi executada */
export function* performSBAs(g: G): Gen<boolean> {
  const s = g.state;
  let performed = false;
  const losers: { p: PlayerId; reason: string; rule: string }[] = [];
  for (const p of g.playersInGame()) {
    const pl = s.players[p];
    if (pl.life <= 0) losers.push({ p, reason: 'vida 0 ou menos', rule: '704.5a' });
    else if (pl.drewFromEmpty) losers.push({ p, reason: 'comprou de um grimório vazio', rule: '704.5b' });
    else if ((pl.counters.poison ?? 0) >= 10) losers.push({ p, reason: 'dez marcadores de veneno', rule: '704.5c' });
    else if (Object.values(pl.commanderDamage).some((d) => d >= 21)) losers.push({ p, reason: '21 de dano de combate do mesmo comandante', rule: '704.6c' });
  }
  // CR 104.3: "você não pode perder o jogo" (Darksteel Angel) — essas ações de estado não fazem nada com o jogador
  for (let i = losers.length - 1; i >= 0; i--) if (cantLoseGame(g, losers[i].p)) losers.splice(i, 1);
  for (const pl of s.players) pl.drewFromEmpty = false;
  // CR 702.131b-c: ascensão num permanente — não usa a pilha e vale antes das outras ações de estado (ruling de Tendershoot Dryad)
  for (const p of g.playersInGame()) {
    const pl = s.players[p];
    if (pl.citysBlessing) continue;
    const meus = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p);
    if (meus.length >= 10 && meus.some((id) => hasKw(g, id, 'ascend'))) {
      pl.citysBlessing = true;
      g.log(`${pl.name} recebe a bênção da cidade.`, { rule: '702.131c' });
      g.bump();
    }
  }

  // objetos
  const toGraveyard: ObjId[] = [];
  const toDestroy: ObjId[] = [];
  const cease: ObjId[] = [];
  const unattach: ObjId[] = [];
  for (const zone of ['graveyard', 'hand', 'library', 'exile', 'command', 'stack'] as ZoneName[]) {
    const ids = zone === 'graveyard' || zone === 'hand' || zone === 'library' ? s.zones[zone].flat() : s.zones[zone];
    for (const id of ids) {
      const o = s.objects[id];
      if (o.isToken) cease.push(id); // CR 704.5d
      else if (o.isCopy && zone !== 'stack') {
        // CR 704.5e, com a exceção da cópia preparada (722.3c)
        const preparedBy = o.data.preparedBy as ObjId | undefined;
        const holder = preparedBy !== undefined ? s.objects[preparedBy] : undefined;
        if (!(zone === 'exile' && holder && holder.zone === 'battlefield' && holder.prepared)) cease.push(id);
      }
    }
  }
  const legendGroups = new Map<string, ObjId[]>();
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (o.phasedOut) continue;
    const c = chars(g, id);
    if (c.types.includes('Creature')) {
      const t = c.toughness ?? 0;
      if (t <= 0) toGraveyard.push(id); // CR 704.5f
      else if (o.damage >= t && !hasKw(g, id, 'indestructible')) toDestroy.push(id); // CR 704.5g
      else if (o.deathtouched && !hasKw(g, id, 'indestructible')) toDestroy.push(id); // CR 704.5h
    }
    if (c.types.includes('Planeswalker') && (o.counters.loyalty ?? 0) <= 0) toGraveyard.push(id); // CR 704.5i
    if (c.supertypes.includes('Legendary')) {
      const key = `${c.controller}|${c.name}`;
      if (!legendGroups.has(key)) legendGroups.set(key, []);
      legendGroups.get(key)!.push(id);
    }
    if (o.attachedTo !== null) {
      const target = s.objects[o.attachedTo];
      // Aura presa a uma carta fora do campo só é legal se a habilidade de encantar aceitar essa carta (Animate Dead)
      const ok = !!target && ((target.zone === 'battlefield' && !target.phasedOut) || (target.zone !== 'battlefield' && c.subtypes.includes('Aura') && !isBestowed(o)));
      if (isBestowed(o) && (!ok || !isCreature(g, o.attachedTo))) {
        unattach.push(id); // CR 702.103e: Aura de bestow solta vira criatura, não vai ao cemitério
      } else if (c.subtypes.includes('Aura')) {
        // CR 704.5m: Aura presa a objeto ilegal ou a nada
        const def = o.copyOf?.def ?? o.def;
        if (!ok || isCreature(g, id) || !enchantCandidates(g, def, 0, controllerOf(g, id), [], id).includes(o.attachedTo)) toGraveyard.push(id);
      } else if (c.subtypes.includes('Equipment')) {
        if (!ok || !isCreature(g, o.attachedTo) || isCreature(g, id) || protectionBlocksEquip(g, o.attachedTo, id)) unattach.push(id); // CR 704.5n, 702.16d
      } else unattach.push(id); // CR 704.5p
    } else if (c.subtypes.includes('Aura') && !o.data.auraUnattachedOk) toGraveyard.push(id); // CR 704.5m
    // CR 704.5q: +1/+1 e -1/-1 se anulam
    const plus = o.counters['+1/+1'] ?? 0, minus = o.counters['-1/-1'] ?? 0;
    if (plus > 0 && minus > 0) {
      const n = Math.min(plus, minus);
      o.counters['+1/+1'] = plus - n; o.counters['-1/-1'] = minus - n;
      if (!o.counters['+1/+1']) delete o.counters['+1/+1'];
      if (!o.counters['-1/-1']) delete o.counters['-1/-1'];
      g.bump();
      performed = true;
    }
    // CR 704.5s / 714.4: Saga com marcadores de conhecimento >= capítulo final, sem habilidade de capítulo dela na
    // pilha ou esperando para ir para a pilha
    if (c.subtypes.includes('Saga')) {
      const capitulos = (abilityId: string | undefined) => (abilityId ? (registry.abilities.get(abilityId) as { chapters?: number[] } | undefined)?.chapters : undefined);
      let final = (o.data.finalChapter as number | undefined) ?? 0;
      for (const a of c.abilities) for (const n of capitulos(a.id) ?? []) final = Math.max(final, n);
      const onStack = s.zones.stack.some((sid) => s.objects[sid].stack?.source === id && s.objects[sid].stack?.kind === 'triggered' && !!capitulos(s.objects[sid].stack?.abilityId));
      const pending = s.pendingTriggers.some((p) => p.source === id && !!capitulos(p.abilityId));
      if (final > 0 && (o.counters.lore ?? 0) >= final && !onStack && !pending) o.data.sagaSacrifice = true;
    }
  }
  // "desde a última verificação" (CR 704.5h): a marca de toque mortífero vale uma vez
  for (const id of s.zones.battlefield) s.objects[id].deathtouched = false;
  // regra da lenda (CR 704.5j)
  const legendLosers: ObjId[] = [];
  for (const [, ids] of legendGroups) {
    if (ids.length < 2) continue;
    const ctrl = controllerOf(g, ids[0]);
    const keep = yield* chooseItems(g, ctrl, `Regra da lenda: escolha qual ${nameOf(g, ids[0])} fica`, ids.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
    for (const id of ids) if (String(id) !== keep[0]) legendLosers.push(id);
  }

  const sagaSac = s.zones.battlefield.filter((id) => s.objects[id].data.sagaSacrifice);
  for (const id of sagaSac) delete s.objects[id].data.sagaSacrifice;

  if (losers.length || toGraveyard.length || toDestroy.length || cease.length || unattach.length || legendLosers.length || sagaSac.length) performed = true;

  for (const id of unattach) { s.objects[id].attachedTo = null; g.bump(); }
  for (const id of cease) destroyObject(g, id);
  const moves = [...new Set([...toGraveyard, ...toDestroy, ...legendLosers])].filter((id) => s.objects[id]);
  if (moves.length || sagaSac.length) {
    const reqs = moves.map((id) => ({ id, to: 'graveyard' as ZoneName }));
    yield* moveObjects(g, reqs, 'sba');
    if (sagaSac.length) yield* moveObjects(g, sagaSac.filter((id) => g.state.objects[id]).map((id) => ({ id, to: 'graveyard' as ZoneName })), 'sacrifice');
  }
  for (const l of losers) {
    g.log(`${g.state.players[l.p].name} perde a partida: ${l.reason}.`, { rule: l.rule });
    loseGame(g, l.p);
  }
  // comandante no cemitério ou exílio desde a última verificação (CR 903.9a, 704.6d)
  const offered = g.state.commanderOffered;
  for (const zone of ['graveyard', 'exile'] as const) {
    const ids = zone === 'graveyard' ? g.state.zones.graveyard.flat() : g.state.zones.exile;
    for (const id of [...ids]) {
      const o = g.state.objects[id];
      if (!o || o.card === null || !g.state.cards[o.card]?.isCommander || offered.includes(id)) continue;
      if (g.state.players[o.owner].left) continue;
      offered.push(id);
      const yes = yield* yesNo(g, o.owner, `Pôr ${nameOf(g, id)} de volta na zona de comando? (CR 903.9a)`);
      if (yes) {
        yield* moveObjects(g, [{ id, to: 'command' }], 'sba');
        performed = true;
      }
    }
  }
  g.state.commanderOffered = offered.filter((id) => g.state.objects[id]);
  checkGameEnd(g);
  return performed;
}

/** o jogador perde e sai da partida (CR 104.5, 800.4a) */
export function loseGame(g: G, p: PlayerId): void {
  const pl = g.state.players[p];
  if (pl.left || cantLoseGame(g, p)) return;
  pl.lost = true;
  leaveGame(g, p);
}

/** CR 800.4a: o que acontece quando um jogador sai */
export function leaveGame(g: G, p: PlayerId): void {
  const s = g.state;
  const pl = s.players[p];
  if (pl.left) return;
  pl.left = true;
  // objetos que o jogador possui saem do jogo
  for (const zone of ['battlefield', 'stack', 'exile', 'command'] as const) {
    for (const id of [...s.zones[zone]]) if (s.objects[id]?.owner === p) { removeFromCombat(g, id); destroyObject(g, id); }
  }
  for (const zone of ['library', 'hand', 'graveyard'] as const) for (const id of [...s.zones[zone][p]]) destroyObject(g, id);
  // efeitos que dão a esse jogador o controle de algo terminam
  s.effects = s.effects.filter((e) => !(e.mods.some((m) => m.k === 'control' && m.player === p)));
  g.bump();
  // habilidades na pilha controladas por ele deixam de existir; objetos que ainda controla são exilados
  for (const id of [...s.zones.stack]) if (s.objects[id]?.stack?.controller === p && s.objects[id].def === '') destroyObject(g, id);
  const stillControlled = s.zones.battlefield.filter((id) => controllerOf(g, id) === p);
  for (const id of [...stillControlled, ...s.zones.stack.filter((id) => s.objects[id]?.stack?.controller === p)]) {
    const o = s.objects[id];
    if (!o) continue;
    // exílio direto, sem substituições (não é ação baseada em estado nem efeito)
    const zoneList = o.zone === 'stack' ? s.zones.stack : s.zones.battlefield;
    zoneList.splice(zoneList.indexOf(id), 1);
    o.zone = 'exile';
    o.controller = o.owner;
    s.zones.exile.push(id);
  }
  // o que continua no campo sob o controle de outro (por efeito de controle) não pode voltar a quem saiu se o efeito
  // acabar: o controle de base passa ao dono
  for (const id of s.zones.battlefield) if (s.objects[id].controller === p) s.objects[id].controller = s.objects[id].owner;
  s.pendingTriggers = s.pendingTriggers.filter((t) => t.controller !== p); // CR 800.4d
  s.delayedTriggers = s.delayedTriggers.filter((t) => t.controller !== p);
  // CR 725.4: o jogador ativo passa a ser o monarca; se quem sai é o ativo, o próximo na ordem de turno
  if (s.monarch === p) s.monarch = g.playersInGame().length === 0 ? null : s.turn.active !== p && !s.players[s.turn.active].left ? s.turn.active : g.nextPlayer(s.turn.active);
  if (s.priority === p) s.priority = g.nextPlayer(p);
  g.bump();
  emit(g, [{ type: 'leave', player: p }]);
}

/** CR 104.2a e 104.4a: fim da partida */
export function checkGameEnd(g: G): void {
  const s = g.state;
  if (s.gameOver) return;
  const alive = g.playersInGame();
  if (alive.length === 1) {
    s.players[alive[0]].won = true;
    s.gameOver = { winners: alive, draw: false, reason: 'todos os oponentes saíram da partida' };
    g.log(`${s.players[alive[0]].name} vence a partida.`, { rule: '104.2a' });
  } else if (alive.length === 0) {
    s.gameOver = { winners: [], draw: true, reason: 'todos perderam ao mesmo tempo' };
    g.log('A partida termina empatada.', { rule: '104.4a' });
  }
}
