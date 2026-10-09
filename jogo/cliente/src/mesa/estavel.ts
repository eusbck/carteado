// Referências estáveis entre desenhos da mesa, para as cartas (memo) não se desenharem de novo à toa.

import { useMemo, useRef } from 'preact/hooks';

/**
 * Função de identidade fixa que chama sempre a versão mais nova de `f`: a mesa passa os seus tratadores (clicar,
 * arrastar, menu…) às cartas sem que cada desenho da mesa conte como "mudou o tratador".
 */
export function useEstavel<A extends unknown[], R>(f: (...a: A) => R): (...a: A) => R {
  const ref = useRef(f);
  ref.current = f;
  return useMemo(() => (...a: A) => ref.current(...a), []);
}

/** devolve o valor anterior enquanto `igual(anterior, novo)`: listas e mapas recalculados com o mesmo conteúdo */
export function useMesmo<T>(novo: T, igual: (a: T, b: T) => boolean): T {
  const ref = useRef(novo);
  if (ref.current !== novo && !igual(ref.current, novo)) ref.current = novo;
  return ref.current;
}

/** mesmos elementos (por referência), na mesma ordem */
export function mesmaLista<T>(a: readonly T[], b: readonly T[]): boolean {
  return a === b || (a.length === b.length && a.every((x, i) => x === b[i]));
}

/** mapa de listas com as mesmas chaves e as mesmas listas (elemento a elemento) */
export function mesmoMapaDeListas<K, T>(a: ReadonlyMap<K, readonly T[]>, b: ReadonlyMap<K, readonly T[]>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const [k, l] of a) { const m = b.get(k); if (!m || !mesmaLista(l, m)) return false; }
  return true;
}

/** posições {id: [x, y]} iguais */
export function mesmasPosicoes(a: Record<string, [number, number]>, b: Record<string, [number, number]>): boolean {
  if (a === b) return true;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => b[k] !== undefined && a[k][0] === b[k][0] && a[k][1] === b[k][1]);
}
