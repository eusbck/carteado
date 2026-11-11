// Ajudantes do tema "custos de equipar" (deck Cloud Nine): Bruenor Battlehammer, Forge Anew, Fighter Class, Firion,
// Akiri, Zack Fair, Professor Hojo.
import { chars } from '../motor/api.ts';
import type { ActivatedDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** habilidade de equipar, inclusive "equipar [qualidade]" (CR 702.6c, ruling de Forge Anew); reconfigurar não é */
export function ehEquipar(def: ActivatedDef): boolean {
  return def.kw === 'equip';
}

/** quantas habilidades de equipar o jogador já ativou neste turno (motor/stack.ts registra em turnStats.activationLog) */
export function equiparesAtivadosNoTurno(g: G, p: PlayerId): number {
  return (g.state.turnStats[p]?.activationLog ?? []).filter((a) => a.kw === 'equip').length;
}

/** Equipamentos anexados à permanente */
export function equipamentosAnexados(g: G, id: ObjId): ObjId[] {
  return g.state.zones.battlefield.filter((e) => g.state.objects[e].attachedTo === id && chars(g, e).subtypes.includes('Equipment'));
}

/** criatura equipada: tem ao menos um Equipamento anexado (CR 301.5) */
export function ehEquipada(g: G, id: ObjId): boolean {
  return equipamentosAnexados(g, id).length > 0;
}

/** "você pode pagar {0} em vez do custo de equipar": nota comum (Bruenor, Forge Anew) */
export const EQUIPAR_DE_GRACA = 'regra geral: CR 118.9 — {0} é custo alternativo; o motor sempre o usa na primeira habilidade de equipar, já que recusar não guarda a gratuidade para depois (motor/stack.ts totalAbilityCost)';
