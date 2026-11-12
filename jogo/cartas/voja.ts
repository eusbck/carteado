// lote4-c (Voja, Jaws of the Conclave): ajudantes compartilhados das cartas do deck de Elfos e Lobos.
import { chars, controlledBy, defineFn, isCreature, isSubtype, type G } from '../motor/api.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** Elfos (permanentes com o subtipo Elf, inclusive com polimorfo, CR 702.73a) que o jogador controla */
export function elfosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isSubtype(g, id, 'Elf'));
}

/** criaturas Elf que o jogador controla */
export function criaturasElfoDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isCreature(g, id) && isSubtype(g, id, 'Elf'));
}

/** Lobos (Wolf) que o jogador controla */
export function lobosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isSubtype(g, id, 'Wolf'));
}

/** criaturas do jogador com pelo menos um marcador +1/+1 */
export function comMarcadorMaisUm(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isCreature(g, id) && (g.state.objects[id].counters['+1/+1'] ?? 0) > 0);
}

/** maior força / resistência entre as criaturas que o jogador controla (0 sem criaturas) */
export function maiorForca(g: G, p: PlayerId): number {
  const ids = controlledBy(g, p, (id) => isCreature(g, id));
  return ids.length ? Math.max(0, ...ids.map((id) => chars(g, id).power ?? 0)) : 0;
}
export function maiorResistencia(g: G, p: PlayerId): number {
  const ids = controlledBy(g, p, (id) => isCreature(g, id));
  return ids.length ? Math.max(0, ...ids.map((id) => chars(g, id).toughness ?? 0)) : 0;
}

/**
 * Restrição de mana "Gaste esta mana apenas para conjurar uma mágica de criatura" (CR 106.6): vale em qualquer parte do
 * custo total da mágica de criatura (custos adicionais e alternativos), e não em habilidades ativadas (Ancient Ziggurat,
 * Abundant Countryside).
 */
export const SO_MAGICA_DE_CRIATURA = 'lote4-c:soMagicaDeCriatura';
defineFn(SO_MAGICA_DE_CRIATURA, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && !!g.state.objects[purpose.obj] && isCreature(g, purpose.obj));

export const NOTAS = {
  manaCriatura: 'regra geral: CR 106.6 — a mana só pode ser gasta para conjurar mágica de criatura, em qualquer parte do custo total; não em habilidades ativadas (cartas/voja.ts SO_MAGICA_DE_CRIATURA)',
};
