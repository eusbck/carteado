// Domínio (CR 207.2c: "domínio" é uma palavra de habilidade): o número de tipos básicos de terreno entre os terrenos que
// o jogador controla. Genérico, para qualquer carta de domínio (lote 4, frente D: Draco).
import { chars, controlledBy, isLand } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { PlayerId } from '../motor/types.ts';

/** os tipos básicos de terreno (CR 205.3i) */
export const TIPOS_BASICOS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'] as const;

/** quantos tipos básicos de terreno há entre os terrenos que o jogador controla (0 a 5) */
export function dominio(g: G, p: PlayerId): number {
  const tipos = new Set<string>();
  for (const id of controlledBy(g, p, (x) => isLand(g, x))) {
    for (const st of chars(g, id).subtypes) if ((TIPOS_BASICOS as readonly string[]).includes(st)) tipos.add(st);
  }
  return tipos.size;
}
