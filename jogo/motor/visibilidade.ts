// Quem vê um objeto (a regra única de visibilidade da vista, do registro e do diário). Módulo-folha: só depende de
// chars.ts, para registro.ts e diario.ts (importados por actions.ts e pelo resto do motor) não fecharem um ciclo de
// import passando por view.ts → turn.ts → priority.ts → mecanicas.ts → dsl.ts.

import { controllerOf } from './chars.ts';
import type { G } from './game-context.ts';
import type { GameObject, PlayerId } from './types.ts';

export function canSee(g: G, o: GameObject, viewer: PlayerId | null): boolean {
  if (o.zone === 'library') return o.visibleTo === 'all' || (viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer));
  if (o.zone === 'hand') return viewer === o.owner || o.visibleTo === 'all' || (viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer));
  if (o.faceDown) {
    // CR 708.6: o controlador pode olhar o permanente virado para baixo; no exílio, quem tiver permissão
    if (o.zone === 'battlefield' || o.zone === 'stack') return viewer !== null && (controllerOf(g, o.id) === viewer || (Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer)));
    return viewer !== null && Array.isArray(o.visibleTo) && o.visibleTo.includes(viewer);
  }
  return true;
}

/** F1/F3: quem vê o objeto agora (null = todos os jogadores) */
export function quemVe(g: G, o: GameObject): PlayerId[] | null {
  const ps = g.state.players.map((p) => p.id);
  const veem = ps.filter((p) => canSee(g, o, p));
  return veem.length === ps.length ? null : veem;
}
