// Consulta síncrona de características alternativas (CR 720.3a): permissões que examinam uma carta de presságio
// precisam examinar a face pretendida. A zona real e o estado serializado não mudam durante a consulta.
import type { G } from './game-context.ts';
import type { Chars, ObjId } from './types.ts';

const consultas = new WeakMap<G, Map<ObjId, Chars>>();

export function castCharacteristicsOverride(g: G, id: ObjId): Chars | undefined {
  return consultas.get(g)?.get(id);
}

export function withCastCharacteristics<T>(g: G, id: ObjId, caracteristicas: Chars, consultar: () => T): T {
  const anteriores = consultas.get(g);
  const derivadas = g.derived;
  consultas.set(g, new Map([...(anteriores ?? []), [id, caracteristicas]]));
  try { return consultar(); }
  finally {
    if (anteriores) consultas.set(g, anteriores);
    else consultas.delete(g);
    // Não guarda cálculos feitos sob características que só valem para esta consulta.
    g.derived = derivadas;
  }
}
