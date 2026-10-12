// Peças repetidas nas cartas do deck Avengers Assemble (Heroes, comandantes, tipo escolhido, criaturas modificadas).
import { chars, controllerOf, isCreature } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { SCtx } from '../motor/defs.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** é um Hero? (tipo de criatura; vale para a carta em qualquer zona) */
export function ehHeroi(g: G, id: ObjId): boolean {
  return chars(g, id).subtypes.includes('Hero');
}

/** é comandante de alguém? (CR 903.3: a designação é da carta, não do objeto) */
export function ehComandante(g: G, id: ObjId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  return !!o && o.card !== null && !!g.state.cards[o.card]?.isCommander;
}

/** "o seu comandante": a carta comandante de que você é dono, seja quem for que a controle (ruling de Tome of Legends) */
export function ehSeuComandante(g: G, id: ObjId, p: PlayerId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  return ehComandante(g, id) && !!o && o.owner === p;
}

/** CR 607.2d: o tipo de criatura escolhido ao entrar fica gravado no objeto */
export function tipoEscolhido(c: SCtx): string | undefined {
  return c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
}

/** CR 700.9: modificada é a permanente com marcador, equipada ou encantada por uma Aura do controlador dela */
export function modificada(g: G, id: ObjId): boolean {
  const s = g.state;
  const o = s.objects[id];
  if (!o || o.zone !== 'battlefield') return false;
  if (Object.values(o.counters).some((n) => n > 0)) return true;
  const dono = controllerOf(g, id);
  return s.zones.battlefield.some((a) => {
    if (s.objects[a].attachedTo !== id) return false;
    const ch = chars(g, a);
    return ch.subtypes.includes('Equipment') || (ch.subtypes.includes('Aura') && controllerOf(g, a) === dono);
  });
}

/** criaturas atacantes agora */
export function atacantes(g: G): ObjId[] {
  return (g.state.combat?.attackers ?? []).filter((a) => !a.removed && g.state.objects[a.id]?.zone === 'battlefield' && isCreature(g, a.id)).map((a) => a.id);
}