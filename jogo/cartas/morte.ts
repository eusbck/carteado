// Peças do deck Sephiroth: gatilhos por criatura morrendo (Drivnod, The Masamune).
import type { GameEvent } from '../motor/events.ts';
import type { G } from '../motor/game-context.ts';

/** o evento é uma criatura morrendo (do campo para o cemitério)? (CR 700.4) */
export function morteDeCriatura(g: G, e: GameEvent | null | undefined): boolean {
  if (!e || e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
  return !!g.state.lki[e.old]?.chars.types.includes('Creature');
}

/** o disparo veio de uma criatura morrendo? */
export function disparoPorMorte(g: G, tr: { cause: GameEvent | null; batch?: GameEvent[] }): boolean {
  return morteDeCriatura(g, tr.cause) || (tr.batch ?? []).some((e) => morteDeCriatura(g, e));
}
