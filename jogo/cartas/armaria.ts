// Peças das cartas de Equipamento do deck Cloud Nine (Final Fantasy): equipar de graça uma vez por turno, contar o que
// está anexado, olhar quem está equipada.
import { ability, type ActivatedDef, type StaticDef, type TriggeredDef } from '../motor/defs.ts';
import { chars, controllerOf, on, staticAbility, triggered } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

const chaveEquipou = (p: PlayerId) => `equipou:${p}`;

/** é uma habilidade de equipar (CR 702.6; reconfigurar não é, ruling de Forge Anew) */
export const ehEquipar = (def: ActivatedDef | undefined) => def?.kw === 'equip';

/**
 * Registra, sem usar a pilha, que o jogador já ativou uma habilidade de equipar neste turno (o contador do turno zera no
 * começo de cada turno). O gatilho nunca dispara: só anota no momento em que a habilidade é ativada.
 */
export function registraEquipar(): TriggeredDef {
  return triggered(on.custom((e, c) => {
    if (e.type === 'activate') {
      let def: ActivatedDef | undefined;
      try { def = ability(e.abilityId) as ActivatedDef; } catch { def = undefined; }
      if (ehEquipar(def)) c.g.state.turnCounters[chaveEquipou(e.player)] = 1;
    }
    return false;
  }), function* () { /* nunca dispara */ });
}

export const jaEquipouNoTurno = (g: G, p: PlayerId) => (g.state.turnCounters[chaveEquipou(p)] ?? 0) > 0;

/** "Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que ativar em cada turno [seu]" */
export function primeiroEquiparGratis(soNoSeuTurno: boolean, text: string): StaticDef {
  return staticAbility({
    rules: {
      abilityCostModifier: (c, p, _fonte, def) => (p === c.you && ehEquipar(def) && !jaEquipouNoTurno(c.g, p)
        && (!soNoSeuTurno || c.g.state.turn.active === c.you) ? { reduce: 99 } : null),
    },
    text,
  });
}

/** Equipamentos anexados a uma criatura */
export function equipamentosEm(g: G, criatura: ObjId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => g.state.objects[id].attachedTo === criatura && chars(g, id).subtypes.includes('Equipment'));
}

export const equipada = (g: G, criatura: ObjId) => equipamentosEm(g, criatura).length > 0;

/** Equipamentos que o jogador controla */
export function equipamentosDoJogador(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => controllerOf(g, id) === p && chars(g, id).subtypes.includes('Equipment'));
}

/** notas de rulings repetidas */
export const EQUIPAR_GRATIS = {
  primeiro: 'teste: só a primeira habilidade de equipar do turno sai por {0}',
};
