// lote4-b: "precisa ser bloqueada se possível" (The Masamune; CR 509.1c). Gancho `mustBeBlockedIfAble` em RuleHooks.
//
// CR 509.1c: o defensor confere as exigências de bloqueio. A declaração não pode violar restrições e precisa cumprir o
// maior número possível de exigências sem violá-las. Aqui: cada atacante que "precisa ser bloqueado se possível" e que dá
// para bloquear (com ameaçar, por duas criaturas: CR 702.111b) conta uma exigência. O motor estima o máximo cumprível
// com uma distribuição gulosa dos bloqueadores livres e recusa a declaração que cumpre menos que isso.

import { hasKw, hooks, nameOf } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId } from './types.ts';

/** atacantes que precisam ser bloqueados se possível */
export function precisamSerBloqueadas(g: G, atacantes: ObjId[]): ObjId[] {
  const hs = hooks(g, 'mustBeBlockedIfAble');
  if (!hs.length) return [];
  return atacantes.filter((a) => hs.some((h) => h.fn(h.ctx, a)));
}

/** bloqueios que cumprem o máximo de exigências "precisa ser bloqueada" (gulosa: menos bloqueadores possíveis primeiro) */
export function bloqueiosExigidos(g: G, cands: { obj: ObjId; canBlock: ObjId[] }[], exigidas: ObjId[]): [ObjId, ObjId][] {
  const usados = new Set<ObjId>();
  const out: [ObjId, ObjId][] = [];
  const opcoes = (a: ObjId) => cands.filter((c) => c.canBlock.includes(a)).length;
  for (const a of [...exigidas].sort((x, y) => opcoes(x) - opcoes(y))) {
    const n = hasKw(g, a, 'menace') ? 2 : 1;
    const livres = cands.filter((c) => !usados.has(c.obj) && c.canBlock.includes(a)).slice(0, n);
    if (livres.length < n) continue;
    for (const b of livres) { usados.add(b.obj); out.push([b.obj, a]); }
  }
  return out;
}

/** CR 509.1c: null se a declaração cumpre o máximo possível das exigências, senão a mensagem de erro */
export function validaBloqueioObrigatorio(g: G, cands: { obj: ObjId; canBlock: ObjId[] }[], atacantes: ObjId[], blocks: [ObjId, ObjId][]): string | null {
  const exigidas = precisamSerBloqueadas(g, atacantes);
  if (!exigidas.length) return null;
  const possiveis = new Set(bloqueiosExigidos(g, cands, exigidas).map(([, a]) => a)).size;
  const cumpridas = exigidas.filter((a) => blocks.some(([, x]) => x === a)).length;
  if (cumpridas >= possiveis) return null;
  const falta = exigidas.find((a) => !blocks.some(([, x]) => x === a))!;
  return `${nameOf(g, falta)} precisa ser bloqueada se possível (CR 509.1c)`;
}
