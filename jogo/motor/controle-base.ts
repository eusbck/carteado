// lote3-d: a parte das mecânicas de motor/controle.ts que stack.ts e priority.ts consultam. Fica num módulo-folha (só
// importa chars.ts) para não criar ciclo de importação com dsl.ts.
import { hasKw } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId } from './types.ts';

/** palavra-chave das mágicas com segundo dividido */
export const SPLIT_SECOND = 'split second';

/**
 * CR 702.61a: enquanto uma mágica com segundo dividido estiver na pilha, os jogadores não podem conjurar outras mágicas
 * nem ativar habilidades que não sejam de mana. Ações especiais e habilidades de mana continuam (702.61b); gatilhos
 * disparam e vão para a pilha normalmente.
 */
export function splitSecondActive(g: G): boolean {
  return g.state.zones.stack.some((id) => {
    const o = g.state.objects[id];
    return !!o && o.stack?.kind === 'spell' && hasKw(g, id, SPLIT_SECOND);
  });
}

/** palavra-chave "hexproof from activated and triggered abilities" (Volatile Stormdrake) */
export const HEXPROOF_FROM_ABILITIES = 'hexproof from abilities';

/** a origem do alvo é uma habilidade (e não uma mágica)? A fonte de uma mágica é a própria mágica na pilha */
export function sourceIsAbility(g: G, source: ObjId): boolean {
  const o = g.state.objects[source] ?? g.state.lki[source]?.obj;
  return !(o && o.zone === 'stack' && o.stack?.kind === 'spell');
}

