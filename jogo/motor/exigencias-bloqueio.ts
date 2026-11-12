// Exigências de bloqueio juntas (CR 509.1c): "o jogador defensor confere cada exigência de bloqueio ... a declaração
// não pode violar restrições e precisa cumprir o maior número possível de exigências sem violá-las".
// Duas fontes de exigência, contadas juntas:
//  - "[atacante] precisa ser bloqueado se possível": gancho mustBeBlockedIfAble (motor/bloqueio-obrigatorio.ts; The
//    Masamune). Conta uma exigência por atacante; com ameaçar, só se cumpre com dois bloqueadores (CR 702.111b);
//  - "[bloqueador] bloqueia [atacante] se puder": efeito rule:blocksIfAble (motor/bloquear-se-puder.ts; Tolsimir). Conta
//    uma exigência por bloqueador (um bloqueador com várias cumpre uma delas).
// O máximo cumprível é estimado por uma distribuição gulosa (pares primeiro, depois os atacantes com menos opções de
// bloqueador). A distribuição é possível de verdade, então a estimativa nunca passa do máximo real: a validação só
// recusa declarações que cumprem menos que uma alternativa conhecida.

import { hasKw, nameOf } from './chars.ts';
import { precisamSerBloqueadas } from './bloqueio-obrigatorio.ts';
import { exigenciasCumpriveis } from './bloquear-se-puder.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';

type Candidato = { obj: ObjId; canBlock: ObjId[] };

/** bloqueios gulosos que cumprem as exigências: os pares primeiro, depois os atacantes que precisam ser bloqueados */
export function bloqueiosQueCumprem(cands: Candidato[], pares: [ObjId, ObjId][], obrigatorios: ObjId[], precisa: (a: ObjId) => number): [ObjId, ObjId][] {
  const usados = new Set<ObjId>();
  const out: [ObjId, ObjId][] = [];
  for (const [b, a] of pares) {
    if (usados.has(b) || !cands.find((c) => c.obj === b)?.canBlock.includes(a)) continue;
    usados.add(b);
    out.push([b, a]);
  }
  const opcoes = (a: ObjId) => cands.filter((c) => c.canBlock.includes(a)).length;
  for (const a of [...obrigatorios].sort((x, y) => opcoes(x) - opcoes(y))) {
    const falta = precisa(a) - out.filter(([, x]) => x === a).length;
    if (falta <= 0) continue;
    const livres = cands.filter((c) => !usados.has(c.obj) && c.canBlock.includes(a));
    if (livres.length < falta) continue;
    for (const c of livres.slice(0, falta)) { usados.add(c.obj); out.push([c.obj, a]); }
  }
  return out;
}

/** quantas exigências a declaração cumpre */
function cumpridas(pares: [ObjId, ObjId][], obrigatorios: ObjId[], blocks: [ObjId, ObjId][], precisa: (a: ObjId) => number): number {
  const porBloqueador = new Map<ObjId, ObjId[]>();
  for (const [b, a] of pares) porBloqueador.set(b, [...(porBloqueador.get(b) ?? []), a]);
  let n = 0;
  for (const [b, as] of porBloqueador) if (blocks.some(([x, y]) => x === b && as.includes(y))) n++;
  for (const a of obrigatorios) if (blocks.filter(([, y]) => y === a).length >= precisa(a)) n++;
  return n;
}

/** CR 509.1c: null se a declaração cumpre o máximo (estimado) de exigências, senão a mensagem de erro */
export function validaExigenciasDeBloqueio(g: G, defensor: PlayerId, cands: Candidato[], atacantes: ObjId[], blocks: [ObjId, ObjId][]): string | null {
  const pares = exigenciasCumpriveis(g, defensor, cands);
  const obrigatorios = precisamSerBloqueadas(g, atacantes);
  if (!pares.length && !obrigatorios.length) return null;
  const precisa = (a: ObjId) => (hasKw(g, a, 'menace') ? 2 : 1);
  const maximo = cumpridas(pares, obrigatorios, bloqueiosQueCumprem(cands, pares, obrigatorios, precisa), precisa);
  if (cumpridas(pares, obrigatorios, blocks, precisa) >= maximo) return null;
  const par = pares.find(([b]) => !blocks.some(([x, y]) => x === b && pares.some(([pb, pa]) => pb === b && pa === y)));
  if (par) return `${nameOf(g, par[0])} precisa bloquear ${nameOf(g, par[1])} se puder (CR 509.1c)`;
  const a = obrigatorios.find((x) => blocks.filter(([, y]) => y === x).length < precisa(x)) ?? obrigatorios[0];
  return `${nameOf(g, a)} precisa ser bloqueada se possível (CR 509.1c)`;
}
