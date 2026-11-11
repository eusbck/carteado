// Crimes (CR 700.13): mirar um oponente, algo que um oponente controla ou uma carta no cemitério de um oponente.
import { on } from '../motor/api.ts';
import type { TriggerSpec } from '../motor/defs.ts';
import type { GameEvent } from '../motor/events.ts';
import type { G } from '../motor/game-context.ts';
import type { PlayerId, TargetRef } from '../motor/types.ts';

function alvoCriminoso(g: G, p: PlayerId, t: TargetRef): boolean {
  if (t.kind === 'player') return g.isOpponent(p, t.id);
  const o = g.state.objects[t.id];
  if (!o) return false;
  if (o.zone === 'graveyard') return g.isOpponent(p, o.owner);
  if (o.zone === 'battlefield' || o.zone === 'stack') return g.isOpponent(p, o.zone === 'stack' ? (o.stack?.controller ?? o.controller) : o.controller);
  return false;
}

/** "Sempre que você comete um crime": um disparo por mágica ou habilidade que mira (CR 700.13a) */
export function voceCometeCrime(): TriggerSpec {
  return on.batch((evs: GameEvent[], c) => {
    const por = new Set<number>();
    for (const e of evs) if (e.type === 'target' && e.controller === c.you && alvoCriminoso(c.g, c.you, e.target)) por.add(e.by);
    return [...por].map((by) => ({ by }));
  });
}
