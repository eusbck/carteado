// lote4-b: "se uma criatura morrer e isso fizer disparar uma habilidade desencadeada de [...], essa habilidade dispara
// uma vez a mais" (Drivnod, Carnage Dominus; The Masamune; Teysa Karlov tem a mesma forma). Usado no gancho
// `extraTriggers` (motor/triggers.ts), que recebe o evento que disparou cada habilidade.
//
// - Morrer é ir do campo para o cemitério (CR 700.4), olhando a criatura como ela existia no campo (CR 603.10a; ruling 6
//   de Drivnod: um terreno que virou criatura conta).
// - Conta o evento de mudança de zona: gatilhos de "morre", "vai do campo para o cemitério" e "sai do campo" (rulings 3 e
//   4 de Drivnod). Gatilhos de um evento que causa a morte, como "sempre que você sacrifica", não contam (ruling 5).
// - Gatilhos de "um ou mais" (lote de eventos): contam se, sem as mortes do lote, a habilidade não dispararia do mesmo
//   jeito (o mesmo critério do Felix Five-Boots).

import { registry, type RuleHooks, type SCtx, type TriggerCtx, type TriggeredDef } from './defs.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';
import { chars } from './chars.ts';

/** o evento é uma criatura morrendo (CR 700.4) */
export function ehMorteDeCriatura(g: G, e: GameEvent): boolean {
  if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
  return !!g.state.lki[e.old]?.chars.types.includes('Creature');
}

/** o disparo informado ao gancho `extraTriggers` */
export interface Disparo { abilityId: string; source: ObjId; controller: PlayerId; event: Record<string, unknown>; cause: GameEvent | null; batch?: GameEvent[] }

/** a morte de uma criatura fez esta habilidade disparar */
export function morteCausouDisparo(g: G, tr: Disparo): boolean {
  if (tr.cause) return ehMorteDeCriatura(g, tr.cause);
  const def = registry.abilities.get(tr.abilityId) as TriggeredDef | undefined;
  if (!def || def.on.kind !== 'batch' || !tr.batch) return false;
  const sem = tr.batch.filter((e) => !ehMorteDeCriatura(g, e));
  if (sem.length === tr.batch.length) return false;
  const src = g.state.objects[tr.source] ?? g.state.lki[tr.source]?.obj;
  const sc = g.state.objects[tr.source] ? chars(g, tr.source) : g.state.lki[tr.source]?.chars;
  if (!src || !sc) return false;
  const ctx: TriggerCtx = { g, you: tr.controller, source: tr.source, obj: src, chars: sc };
  const r = sem.length ? def.on.match(sem, ctx) : false;
  const lista = Array.isArray(r) ? r : r ? [typeof r === 'object' ? r : {}] : [];
  const este = JSON.stringify(tr.event);
  return !lista.some((x) => JSON.stringify(x) === este);
}

/** a fonte do disparo é um permanente (no campo, ou que acabou de sair dele: CR 603.10a) */
export function disparoDePermanente(g: G, tr: Disparo): boolean {
  const src = g.state.objects[tr.source] ?? g.state.lki[tr.source]?.obj;
  return !!src && src.zone === 'battlefield';
}

/**
 * Ganchos extraTriggers de estáticas com `lookBack` de permanentes que saíram do campo neste lote de eventos (CR 603.10a;
 * ruling 8 de Drivnod: se uma criatura morre junto com Drivnod, inclusive o próprio Drivnod, a habilidade dispara uma
 * vez a mais). Os ganchos das permanentes que continuam no campo vêm de `hooks` como sempre.
 */
export function extraTriggersDeQuemSaiu(g: G, events: GameEvent[]): { fn: NonNullable<RuleHooks['extraTriggers']>; ctx: SCtx }[] {
  const out: { fn: NonNullable<RuleHooks['extraTriggers']>; ctx: SCtx }[] = [];
  const vistos = new Set<ObjId>();
  for (const e of events) {
    if (e.type !== 'zone' || e.from !== 'battlefield' || vistos.has(e.old)) continue;
    vistos.add(e.old);
    const l = g.state.lki[e.old];
    if (!l) continue;
    for (const inst of l.chars.abilities) {
      const def = registry.abilities.get(inst.id);
      if (def?.kind !== 'static' || !def.lookBack || !def.rules?.extraTriggers) continue;
      out.push({ fn: def.rules.extraTriggers, ctx: { g, you: l.chars.controller, source: e.old } });
    }
  }
  return out;
}
