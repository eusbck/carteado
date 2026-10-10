// Bloqueio pelo combate por cliques, sem tela: o que um clique numa carta faz enquanto você declara os
// bloqueadores e a resposta que vai para o motor. A mesa (Mesa.tsx) só desenha. As regras que dependem de
// mais de um bloqueio (ameaça, por exemplo) continuam com o motor, que recusa a declaração inteira (o motivo
// aparece no painel do bloqueio).

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
 * Clique numa carta durante a declaração: na sua criatura (bloqueando ou não), ela fica escolhida; depois, num
 * atacante que ela pode bloquear, passa a bloqueá-lo (se já bloqueava outro, troca). A escolhida clicada de novo sai
 * da escolha e solta o bloqueio dela. Devolve o novo estado, uma recusa com o motivo, ou null quando o clique não faz
 * nada.
 */
export function cliqueBloqueio(d: DecisaoBloqueio, e: EstadoBloqueio, carta: CartaClicada): EstadoBloqueio | { recusa: string } | null {
  if (carta.atacando) {
    if (e.ativo === null) return { recusa: 'Clique antes na sua criatura que vai bloquear' };
    if (!podeBloquear(d, e.ativo, carta.id)) return { recusa: 'Ela não pode bloquear essa criatura' };
    // vale também para quem já bloqueava: troca de atacante (o mesmo atacante de novo só confirma)
    return { bloqueios: { ...e.bloqueios, [e.ativo]: carta.id }, ativo: null };
  }
  if (d.candidates.some((c) => c.obj === carta.id && c.canBlock.length > 0)) {
    // a escolhida, clicada de novo: sai da escolha e solta o bloqueio dela
    if (carta.id === e.ativo) return soltarBloqueio(e, carta.id);
    return { bloqueios: e.bloqueios, ativo: carta.id };
  }
  if (carta.minhaCriatura) return { recusa: 'Essa criatura não pode bloquear' };
  return null;
}

/** solta o bloqueio de `b` (o "×" da linha no painel); se ela era a escolhida, sai da escolha também */
export function soltarBloqueio(e: EstadoBloqueio, b: ObjId): EstadoBloqueio {
  const n = { ...e.bloqueios };
  delete n[b];
  return { bloqueios: n, ativo: e.ativo === b ? null : e.ativo };
}

/**
 * Nome de cada objeto para o painel e o número na carta: os de nome repetido ganham "#1", "#2"… na ordem da lista
 * ("Zumbi #2"); os de nome único ficam só com o nome (n = null). Vale para atacantes e bloqueadores.
 */
export function numerarIguais(ids: readonly ObjId[], nome: (id: ObjId) => string): Map<ObjId, { rotulo: string; n: number | null }> {
  const nomes = ids.map(nome);
  const total = new Map<string, number>();
  for (const x of nomes) total.set(x, (total.get(x) ?? 0) + 1);
  const visto = new Map<string, number>();
  const m = new Map<ObjId, { rotulo: string; n: number | null }>();
  ids.forEach((id, i) => {
    const x = nomes[i];
    if (total.get(x)! < 2) { m.set(id, { rotulo: x, n: null }); return; }
    const k = (visto.get(x) ?? 0) + 1;
    visto.set(x, k);
    m.set(id, { rotulo: `${x} #${k}`, n: k });
  });
  return m;
}

/** a declaração que vai para o motor: cada bloqueador com o atacante que ele bloqueia */
export function respostaBloqueio(b: Bloqueios): Extract<Answer, { kind: 'blockers' }> {
  return { kind: 'blockers', blocks: Object.entries(b).map(([bloqueador, atacante]) => [Number(bloqueador), atacante] as [ObjId, ObjId]) };
}
