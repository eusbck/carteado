// Ajudantes das cartas próprias da mesa (decks do Lula e do Bolsonaro; dados em proprias/cartas.json).

import { controllerOf, nameOf, type G } from '../motor/api.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** fichas chamadas Eleitor que o jogador controla */
export function eleitoresDe(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => ehEleitor(g, id) && controllerOf(g, id) === p);
}

export function ehEleitor(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.isToken === true && nameOf(g, id) === 'Eleitor';
}

/** jogador defensor de uma criatura atacante: quem ela ataca, ou quem controla o planeswalker ou a batalha atacada */
export function defensorDe(g: G, atacante: ObjId): PlayerId | null {
  const a = g.state.combat?.attackers.find((x) => x.id === atacante && !x.removed);
  if (!a) return null;
  return a.target.kind === 'player' ? a.target.id : controllerOf(g, a.target.id);
}
