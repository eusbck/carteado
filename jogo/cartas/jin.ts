// Peças e notas de rulings repetidas nas cartas do deck Jin's Vengeance (equipamentos, infectar, históricas).
import { chars, controllerOf } from '../motor/api.ts';
import type { TriggerSpec } from '../motor/defs.ts';
import { on } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** notas dos rulings de infectar (CR 702.90), iguais nas cartas do deck */
export const INFECTAR = {
  veneno: 'regra geral: CR 704.5c — o jogador com dez ou mais marcadores de veneno perde o jogo (motor/sba.ts)',
  emVez: 'regra geral: CR 702.90b — o dano de fonte com infectar vira marcadores -1/-1 na criatura ou de veneno no jogador, em vez de dano marcado ou perda de vida (motor/actions.ts dealDamage)',
  ficam: 'regra geral: CR 122.1 — os marcadores -1/-1 ficam na criatura; não saem com regeneração nem no fim do turno (motor/turn.ts)',
  eDano: 'regra geral: CR 702.90b — continua sendo dano: vínculo com a vida, prevenção, redirecionamento e gatilhos de dano valem (motor/actions.ts dealDamage)',
  qualquer: 'regra geral: CR 702.90b — infectar vale para qualquer dano da fonte, não só o de combate (motor/actions.ts dealDamage)',
  prevenido: 'regra geral: CR 615.1 — dano prevenido não dá marcadores de veneno nem -1/-1 (motor/actions.ts dealDamage)',
  planeswalker: 'regra geral: CR 120.3c — o dano a planeswalkers tira lealdade normalmente (motor/actions.ts dealDamage)',
};

/** Equipamentos que o jogador controla */
export function equipamentosDe(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => controllerOf(g, id) === p && chars(g, id).subtypes.includes('Equipment'));
}

/** histórica: artefato, lendária ou Saga (CR 700.6) */
export function ehHistorica(g: G, id: ObjId): boolean {
  const ch = chars(g, id);
  return ch.types.includes('Artifact') || ch.supertypes.includes('Legendary') || ch.subtypes.includes('Saga');
}

/** "sempre que a criatura equipada (ou encantada) causa dano de combate a um jogador": c.event.jogador e c.event.dano */
export function anexadaCausaDanoDeCombateAJogador(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && e.source === (c.g.state.objects[c.source]?.attachedTo ?? -1)
    ? { jogador: e.target.id, dano: e.amount, criatura: e.source } : false));
}