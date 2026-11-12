// F1 (estudo do Arena, eventos 1): diário de eventos do motor. `emit` (triggers.ts) acrescenta cada lote de eventos
// simultâneos aqui, com a ordem (`seq`), o lote, a etapa e quem via cada objeto citado NAQUELE instante (depois do
// movimento, o objeto antigo só existe no LKI). Desligado por padrão (`g.diario = null`): as simulações dos bots criam
// e copiam G o tempo todo. O servidor liga no Game da sala (servidor/cena.ts redige por assento).
//
// CONTRATO (combinado entre F1, F2 e F3; mudar só com cuidado, outros módulos dependem destes nomes)

import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId, Step } from './types.ts';

/** por que um objeto trocou de zona; derivado de `cause`, `from`, `to` e dos eventos irmãos do lote */
export type MotivoZona =
  | 'conjurar' | 'resolver' | 'anulada' | 'sem-alvos' | 'comprar' | 'descartar' | 'moer' | 'destruir' | 'sacrificar'
  | 'morrer' | 'legenda' | 'exilar' | 'devolver' | 'buscar' | 'ficha' | 'jogar-terreno' | 'entrar' | 'comandante'
  | 'grimorio' | 'outro';

export interface EntradaDiario {
  /** cresce sempre, nunca repete dentro de um diário */
  seq: number;
  /** eventos com o mesmo `lote` vieram do mesmo emit (simultâneos, CR 603.2) */
  lote: number;
  turno: number;
  etapa: Step;
  ev: GameEvent;
  /** quem via cada objeto citado no evento (obj, old, source, target obj...), no momento do emit; 'all' = público */
  vis: Record<ObjId, PlayerId[] | 'all'>;
  /** só em `ev.type === 'zone'` */
  motivo?: MotivoZona;
}

export interface Diario {
  entradas: EntradaDiario[];
  /** o seq da próxima entrada */
  prox: number;
  /** o número do próximo lote */
  lote: number;
  /** quantas entradas guardar (as mais antigas saem) */
  teto: number;
}

export function novoDiario(teto = 500): Diario {
  return { entradas: [], prox: 0, lote: 0, teto };
}

/** chamado por `emit` com cada lote; não faz nada se `g.diario` for null. IMPLEMENTAR (F1) */
export function registrarLote(g: G, events: GameEvent[]): void {
  void g; void events;
}

/** motivo de uma troca de zona, olhando os irmãos do lote (sacrifice, discard, mill, draw, cast...). IMPLEMENTAR (F1) */
export function motivoDaZona(ev: Extract<GameEvent, { type: 'zone' }>, irmaos: readonly GameEvent[]): MotivoZona {
  void ev; void irmaos;
  return 'outro';
}

/** as entradas depois de `seq` (exclusivo). `salto`: o diário já descartou parte delas (buraco no cursor). */
export function diarioDesde(d: Diario, seq: number): { entradas: EntradaDiario[]; salto: boolean } {
  const primeiro = d.entradas[0]?.seq ?? d.prox;
  const salto = seq + 1 < primeiro;
  return { entradas: d.entradas.filter((e) => e.seq > seq), salto };
}
