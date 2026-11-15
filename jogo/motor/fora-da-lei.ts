// Fora da lei / outlaw (CR 700.12, 700.12a): designação, não um tipo de criatura.
import { chars } from './chars.ts';
import type { G } from './game-context.ts';
import type { Chars, ObjId } from './types.ts';

export const OUTLAW_TYPES = ['Assassin', 'Mercenary', 'Pirate', 'Rogue', 'Warlock'] as const;

/** Vale para cartas, mágicas e permanentes: basta um dos cinco tipos, mesmo com outros tipos. */
export function hasOutlawType(c: Pick<Chars, 'subtypes'>): boolean {
  return OUTLAW_TYPES.some((tipo) => c.subtypes.includes(tipo));
}

export function isOutlaw(g: G, id: ObjId): boolean {
  return hasOutlawType(chars(g, id));
}
