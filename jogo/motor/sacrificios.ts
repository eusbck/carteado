// Contagem de sacrifícios por jogador e turno (CR 701.21a).
// Conta o evento de sacrificar, inclusive quando uma substituição muda o destino final.
import type { G } from './game-context.ts';
import type { PlayerId } from './types.ts';

export function registrarSacrificio(g: G, jogador: PlayerId): void {
  const st = g.state.turnStats[jogador];
  st.permanentsSacrificed = (st.permanentsSacrificed ?? 0) + 1;
}

/** O histórico do turno inteiro independe de quando a permanente que o consulta entrou no campo. */
export function permanentsSacrificedThisTurn(g: G, jogador: PlayerId): number {
  return g.state.turnStats[jogador]?.permanentsSacrificed ?? 0;
}
