// Ataque por cliques, sem tela (o par de bloqueio.ts): o que um clique numa criatura sua faz enquanto você declara
// os atacantes, e as marcações de várias de uma vez (retângulo no campo, "Atacar com todas" e o selo ×n de um leque
// de fichas). A mesa (Mesa.tsx) só desenha; o alvo de cada uma vem do clique no oponente (Mesa.alvoAtaque) e as
// regras continuam com o motor.

import type { Decision, ObjId, TargetRef } from '../../../motor/types.ts';

type Candidata = Extract<Decision, { kind: 'attackers' }>['candidates'][number];

/** criatura marcada → quem ela ataca (null: marcada, ainda sem alvo) */
export type Ataques = Record<number, TargetRef | null>;

export interface EstadoAtaque {
  ataques: Ataques;
  /** a marcada que recebe o próximo oponente clicado (as marcadas sem alvo também recebem) */
  ativo: ObjId | null;
}

const mesmoAlvo = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

/** um alvo só (um contra um) é automático; senão vai no mesmo da anterior, até você clicar noutro */
export function alvoPadrao(c: Candidata, ultimoAlvo: TargetRef | null): TargetRef | null {
  if (c.targets.length === 1) return c.targets[0];
  return ultimoAlvo && c.targets.some((t) => mesmoAlvo(t, ultimoAlvo)) ? ultimoAlvo : null;
}

/** atacar todo alvo dela tem custo (Ghostly Prison, Propaganda: CR 508.1h): marcar em grupo pula, só o clique nela marca */
const soPagando = (c: Candidata) => !!c.costs && c.costs.every((n) => n > 0);

/**
 * Clique numa criatura sua: desmarcada, fica marcada (com o alvo padrão) e escolhida; marcada mas não escolhida, fica
 * escolhida (o próximo oponente clicado vira o alvo dela); a escolhida clicada de novo é desmarcada. Devolve null se a
 * carta não pode atacar.
 */
export function cliqueAtaque(cands: readonly Candidata[], e: EstadoAtaque, id: ObjId, ultimoAlvo: TargetRef | null): EstadoAtaque | null {
  const c = cands.find((x) => x.obj === id);
  if (!c) return null;
  if (!(id in e.ataques)) return { ataques: { ...e.ataques, [id]: alvoPadrao(c, ultimoAlvo) }, ativo: id };
  if (e.ativo !== id) return { ataques: e.ataques, ativo: id };
  const n = { ...e.ataques };
  delete n[id];
  return { ataques: n, ativo: null };
}

/**
 * Marca de uma vez as candidatas de `ids` que ainda não estão marcadas (as que só atacam pagando ficam de fora). Nenhuma
 * fica escolhida: o próximo oponente clicado vale para todas as marcadas sem alvo.
 */
export function marcarVarias(cands: readonly Candidata[], ataques: Ataques, ids: readonly ObjId[], ultimoAlvo: TargetRef | null): EstadoAtaque {
  const n = { ...ataques };
  for (const id of ids) {
    const c = cands.find((x) => x.obj === id);
    if (!c || id in n || soPagando(c)) continue;
    n[id] = alvoPadrao(c, ultimoAlvo);
  }
  return { ataques: n, ativo: null };
}

/**
 * O selo ×n de um leque de fichas: com todas as que dá para marcar já marcadas, desmarca o leque inteiro; senão marca
 * as que faltam. Devolve null se nenhuma do leque pode atacar.
 */
export function alternarLeque(cands: readonly Candidata[], e: EstadoAtaque, ids: readonly ObjId[], ultimoAlvo: TargetRef | null): EstadoAtaque | null {
  const doLeque = cands.filter((c) => ids.includes(c.obj));
  const marcaveis = doLeque.filter((c) => c.obj in e.ataques || !soPagando(c));
  if (!marcaveis.length) return null;
  if (marcaveis.every((c) => c.obj in e.ataques)) {
    const n = { ...e.ataques };
    for (const c of doLeque) delete n[c.obj];
    return { ataques: n, ativo: e.ativo !== null && ids.includes(e.ativo) ? null : e.ativo };
  }
  return marcarVarias(cands, e.ataques, ids, ultimoAlvo);
}
