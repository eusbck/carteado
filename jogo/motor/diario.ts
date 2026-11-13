// F1 (estudo do Arena, eventos 1): diário de eventos do motor. `emit` (triggers.ts) acrescenta cada lote de eventos
// simultâneos aqui, com a ordem (`seq`), o lote, a etapa e quem via cada objeto citado NAQUELE instante (depois do
// movimento, o objeto antigo só existe no LKI). Desligado por padrão (`g.diario = null`): as simulações dos bots criam
// e copiam G o tempo todo. O servidor liga no Game da sala (servidor/cena.ts redige por assento).
//
// CONTRATO (combinado entre F1, F2 e F3; mudar só com cuidado, outros módulos dependem destes nomes)

import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId, Step } from './types.ts';
import { quemVe } from './visibilidade.ts';

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
  /** motivos ditos pelo motor antes de mover (`dicaDeMotivo`), pelo id antigo; consumidos ao registrar */
  dicas?: Record<ObjId, MotivoZona>;
}

export function novoDiario(teto = 500): Diario {
  return { entradas: [], prox: 0, lote: 0, teto };
}

/** chamado por `emit` com cada lote; não faz nada se `g.diario` for null */
export function registrarLote(g: G, events: GameEvent[]): void {
  const d = g.diario;
  if (!d || events.length === 0) return;
  const lote = d.lote++;
  const turno = g.state.turn.number;
  const etapa = g.state.turn.step;
  for (const ev of events) {
    const vis: Record<ObjId, PlayerId[] | 'all'> = {};
    for (const id of idsDoEvento(ev)) {
      if (id in vis) continue;
      const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
      // objeto que nem existe nem ficou no LKI: ninguém vê (o servidor não manda o id)
      vis[id] = o ? (quemVe(g, o) ?? 'all') : [];
    }
    const e: EntradaDiario = { seq: d.prox++, lote, turno, etapa, ev, vis };
    if (ev.type === 'zone') {
      const dica = d.dicas?.[ev.old];
      if (dica !== undefined) delete d.dicas![ev.old];
      e.motivo = dica ?? motivoDaZona(ev, events, g);
    }
    d.entradas.push(e);
  }
  if (d.entradas.length > d.teto) d.entradas.splice(0, d.entradas.length - d.teto);
}

/**
 * Eventos que só interessam à cena ('resolving', 'countered', 'fizzled'): vão ao diário, num lote próprio, sem passar
 * por `emit` (que procura gatilhos em todo o campo e atualiza as estatísticas do turno: custo à toa nos bots e risco de
 * um `on.custom` reagir a um tipo novo). Sem diário, não faz nada.
 */
export function anotarNoDiario(g: G, events: GameEvent[]): void {
  if (g.diario) registrarLote(g, events);
}

/**
 * Antes de mover, o motor pode dizer o motivo que a `cause` não distingue (a regra da lenda sai com 'sba', junto com as
 * mortes, porque as ações de estado são simultâneas, CR 704.3). Indexado pelo id antigo; não faz nada sem diário.
 */
export function dicaDeMotivo(g: G, ids: readonly ObjId[], motivo: MotivoZona): void {
  const d = g.diario;
  if (!d || ids.length === 0) return;
  d.dicas ??= {};
  for (const id of ids) d.dicas[id] = motivo;
}

/** os ObjIds citados num evento (cada `vis` sai deles) */
function idsDoEvento(ev: GameEvent): ObjId[] {
  const ids: ObjId[] = [];
  const x = ev as { obj?: unknown; old?: unknown; source?: unknown; target?: { kind: string; id: number } };
  if (typeof x.obj === 'number') ids.push(x.obj);
  if (typeof x.old === 'number') ids.push(x.old);
  if (typeof x.source === 'number') ids.push(x.source);
  if (x.target && typeof x.target === 'object' && x.target.kind === 'obj') ids.push(x.target.id);
  switch (ev.type) {
    case 'target': ids.push(ev.by); break;
    case 'attach': ids.push(ev.to); break;
    case 'unattach': ids.push(ev.from); break;
    case 'attackers': for (const a of ev.attackers) { ids.push(a.obj); if (a.target.kind === 'obj') ids.push(a.target.id); } break;
    case 'blockers': for (const [b, a] of ev.blocks) ids.push(b, a); break;
    case 'mill': ids.push(...ev.objs); break;
    case 'connive': ids.push(...ev.discarded); break;
    case 'amass': if (ev.army !== null) ids.push(ev.army); break;
    case 'ringTempts': if (ev.bearer !== null) ids.push(ev.bearer); break;
    case 'blight': ids.push(ev.creature); break;
    default: break;
  }
  return ids;
}

/** `cause` de moveObjects/putOntoBattlefield que já diz o motivo sozinha */
const POR_CAUSA: Record<string, MotivoZona> = {
  draw: 'comprar', discard: 'descartar', mill: 'moer', destroy: 'destruir', sacrifice: 'sacrificar', counter: 'anulada',
  fizzle: 'sem-alvos', resolve: 'resolver', token: 'ficha', play: 'jogar-terreno', search: 'buscar', bounce: 'devolver',
  exile: 'exilar', cast: 'conjurar', legend: 'legenda', commander: 'comandante',
};

/**
 * Motivo de uma troca de zona, olhando os irmãos do lote (sacrifice, discard, cast...). `g` (opcional) dá o LKI, para
 * separar a morte por ação de estado (criatura, planeswalker, batalha) da Aura que cai.
 * Conjurar não passa por aqui: a mágica vai à pilha sem evento `zone` (stack.ts, moveRaw); o lote traz `cast`.
 */
export function motivoDaZona(ev: Extract<GameEvent, { type: 'zone' }>, irmaos: readonly GameEvent[], g?: G): MotivoZona {
  // o comandante que iria a outra zona e vai ao comando (CR 903.9), ou volta pela ação de estado
  if (ev.to === 'command' && ev.from !== 'nowhere') return 'comandante';
  for (const e of irmaos) {
    if (e.type === 'sacrifice' && (e.obj === ev.obj || e.old === ev.old)) return 'sacrificar';
    if (e.type === 'discard' && e.obj === ev.obj) return 'descartar';
    if (e.type === 'cast' && e.obj === ev.obj) return 'conjurar';
  }
  if (ev.cast) return 'conjurar';
  const porCausa = POR_CAUSA[ev.cause];
  if (porCausa) return porCausa;
  if (ev.cause === 'sba') {
    if (ev.from === 'battlefield' && ev.to === 'graveyard') {
      const tipos = g?.state.lki[ev.old]?.chars.types;
      return !tipos || tipos.some((t) => t === 'Creature' || t === 'Planeswalker' || t === 'Battle') ? 'morrer' : 'outro';
    }
    return 'outro';
  }
  // causas genéricas ('effect' e as das mecânicas): pelo caminho
  if (ev.from === 'nowhere') return ev.token ? 'ficha' : 'entrar';
  if (ev.to === 'exile') return 'exilar';
  if (ev.to === 'library') return 'grimorio';
  if (ev.from === 'battlefield' && ev.to === 'hand') return 'devolver';
  if (ev.from === 'battlefield' && ev.to === 'graveyard') return 'morrer';
  if (ev.to === 'battlefield') return 'entrar';
  return 'outro';
}

/** as entradas depois de `seq` (exclusivo). `salto`: o diário já descartou parte delas (buraco no cursor). */
export function diarioDesde(d: Diario, seq: number): { entradas: EntradaDiario[]; salto: boolean } {
  const primeiro = d.entradas[0]?.seq ?? d.prox;
  const salto = seq + 1 < primeiro;
  return { entradas: d.entradas.filter((e) => e.seq > seq), salto };
}
