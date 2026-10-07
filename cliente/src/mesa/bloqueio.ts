// Bloqueio pelo combate por cliques, sem tela: o que um clique numa carta faz enquanto você declara os
// bloqueadores e a resposta que vai para o motor. A mesa (Mesa.tsx) só desenha. As regras que dependem de
// mais de um bloqueio (ameaça, por exemplo) continuam com o motor, que recusa a declaração inteira.

import type { Answer, Decision, ObjId } from '../../../motor/types.ts';

type DecisaoBloqueio = Extract<Decision, { kind: 'blockers' }>;

/** bloqueador → atacante que ele bloqueia (vários bloqueadores podem apontar para o mesmo atacante) */
export type Bloqueios = Record<number, ObjId>;

export interface EstadoBloqueio {
  bloqueios: Bloqueios;
  /** a sua criatura escolhida, esperando o clique no atacante */
  ativo: ObjId | null;
}

/** a carta clicada, do jeito que a mesa a vê */
export interface CartaClicada {
  id: ObjId;
  /** está atacando (de qualquer jogador: em 4 jogadores aparecem também os ataques aos outros) */
  atacando: boolean;
  /** é uma criatura sua */
  minhaCriatura: boolean;
}

/** o motor diz que esta criatura pode bloquear aquele atacante (só os atacantes que atacam você entram) */
export function podeBloquear(d: DecisaoBloqueio, bloqueador: ObjId, atacante: ObjId): boolean {
  return d.candidates.some((c) => c.obj === bloqueador && c.canBlock.includes(atacante));
}

/**
 * Clique numa carta durante a declaração: na sua criatura, ela fica escolhida (de novo, deixa de estar; se já
 * bloqueava, solta o bloqueio); depois, num atacante que ela pode bloquear, passa a bloqueá-lo. Devolve o novo
 * estado, uma recusa com o motivo, ou null quando o clique não faz nada.
 */
export function cliqueBloqueio(d: DecisaoBloqueio, e: EstadoBloqueio, carta: CartaClicada): EstadoBloqueio | { recusa: string } | null {
  if (carta.atacando) {
    if (e.ativo !== null && podeBloquear(d, e.ativo, carta.id)) return { bloqueios: { ...e.bloqueios, [e.ativo]: carta.id }, ativo: null };
    return { recusa: e.ativo === null ? 'Clique antes na sua criatura que vai bloquear' : 'Ela não pode bloquear essa criatura' };
  }
  if (e.bloqueios[carta.id] !== undefined) {
    const n = { ...e.bloqueios };
    delete n[carta.id];
    return { bloqueios: n, ativo: e.ativo };
  }
  if (d.candidates.some((c) => c.obj === carta.id && c.canBlock.length > 0)) return { bloqueios: e.bloqueios, ativo: carta.id === e.ativo ? null : carta.id };
  if (carta.minhaCriatura) return { recusa: 'Essa criatura não pode bloquear' };
  return null;
}

/** a declaração que vai para o motor: cada bloqueador com o atacante que ele bloqueia */
export function respostaBloqueio(b: Bloqueios): Extract<Answer, { kind: 'blockers' }> {
  return { kind: 'blockers', blocks: Object.entries(b).map(([bloqueador, atacante]) => [Number(bloqueador), atacante] as [ObjId, ObjId]) };
}
