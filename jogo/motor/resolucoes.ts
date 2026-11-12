// lote4-b: "se esta é a N-ésima vez que esta habilidade resolveu neste turno" (Sephiroth, Fabled SOLDIER).
//
// A contagem é do objeto (CR 400.7: a permanente que sai do campo e volta é um objeto novo, sem memória do anterior) e do
// turno. Fica guardada no próprio objeto (`data`), com o número do turno: no turno seguinte recomeça do zero.
// Chame `contaResolucao` uma vez, no começo da resolução da habilidade (CR 608.2): ela conta esta resolução e devolve o
// total no turno, contando esta. Se a fonte já não existe (saiu do campo), não há o que contar e devolve 0.

import type { G } from './game-context.ts';
import type { ObjId } from './types.ts';

/** registra mais uma resolução da habilidade `chave` da fonte neste turno e devolve quantas foram, contando esta */
export function contaResolucao(g: G, fonte: ObjId, chave: string): number {
  const o = g.state.objects[fonte];
  if (!o || o.zone !== 'battlefield') return 0;
  const k = `resolucoes:${chave}`;
  const turno = g.state.turn.number;
  const atual = o.data[k] as { turno: number; n: number } | undefined;
  const n = atual && atual.turno === turno ? atual.n + 1 : 1;
  o.data[k] = { turno, n };
  return n;
}

/** quantas vezes a habilidade `chave` da fonte resolveu neste turno (sem contar) */
export function resolucoesNoTurno(g: G, fonte: ObjId, chave: string): number {
  const o = g.state.objects[fonte];
  const atual = o?.data[`resolucoes:${chave}`] as { turno: number; n: number } | undefined;
  return atual && atual.turno === g.state.turn.number ? atual.n : 0;
}
