// Onda B (estudo do Arena, registro R5 a R8, R11): a lógica do Registro da partida, sem Preact, para testar sozinha.
//  - categoria de cada linha (o ícone e os filtros por tipo);
//  - quem a linha envolve (o filtro por jogador) e se ela afetou você (o destaque);
//  - a árvore rodada → vez de cada jogador → etapa, com as linhas de sistema da sala intercaladas pelo `apos`;
//  - o texto para copiar.

import type { Step } from '../../../motor/types.ts';
import type { LogLinhaView } from '../../../motor/view.ts';
import type { LinhaSistema } from '../../../servidor/protocolo.ts';

export type Categoria = 'magia' | 'ataque' | 'dano' | 'vida' | 'morte' | 'compra' | 'ficha' | 'gatilho' | 'sistema' | 'manual' | 'outro';

/** as categorias que viram filtro, na ordem dos botões */
export const CATEGORIAS: { id: Categoria; nome: string }[] = [
  { id: 'magia', nome: 'Mágicas' },
  { id: 'gatilho', nome: 'Gatilhos' },
  { id: 'ataque', nome: 'Combate' },
  { id: 'dano', nome: 'Dano' },
  { id: 'vida', nome: 'Vida' },
  { id: 'morte', nome: 'Mortes e saídas' },
  { id: 'compra', nome: 'Compras' },
  { id: 'ficha', nome: 'Fichas' },
  { id: 'manual', nome: 'Ajustes' },
  { id: 'sistema', nome: 'Sistema' },
];

const POR_KIND: Record<string, Categoria> = {
  conjura: 'magia', ativa: 'magia', terreno: 'magia', resolve: 'magia', 'nao-resolve': 'magia',
  gatilho: 'gatilho',
  ataque: 'ataque', bloqueio: 'ataque',
  dano: 'dano',
  vida: 'vida',
  morte: 'morte', zona: 'morte',
  compra: 'compra',
  ficha: 'ficha',
  manual: 'manual',
  turno: 'sistema', mulligan: 'sistema', fim: 'sistema', sistema: 'sistema',
};

/** uma linha do motor ou da sala, já pronta para a janela */
export interface LinhaReg {
  /** chave estável: o seq do motor, ou "s" + id da linha de sistema da sala */
  chave: string;
  categoria: Categoria;
  /** a linha do motor (null nas linhas de sistema da sala) */
  log: LogLinhaView | null;
  sistema: LinhaSistema | null;
  turn: number;
  round: number;
  step: Step | null;
}

export function categoria(l: Pick<LogLinhaView, 'kind'>): Categoria {
  return (l.kind && POR_KIND[l.kind]) || 'outro';
}

/** a linha fala do jogador `p`: é dele, cita ele, ou cita uma carta dele como alvo ou vítima */
export function envolve(l: LinhaReg, p: number): boolean {
  if (l.sistema) return l.sistema.quem === p;
  const log = l.log!;
  if (log.actor === p) return true;
  return !!log.refs?.some((r) => (r.k === 'jogador' ? r.id === p : r.ctl === p));
}

/**
 * A linha afetou você: você, ou uma permanente sua, é alvo ou vítima (dano, perda de vida, morte, destruição, mágica
 * mirando você). O que você mesmo mirou numa coisa sua (conjurar, ativar) não conta; o que só aconteceu com você
 * (perder vida, uma criatura sua morrer) conta mesmo quando a linha é sua.
 */
export function afetou(l: LogLinhaView, eu: number | null): boolean {
  if (eu === null || !l.refs) return false;
  const minha = l.refs.some((r) => (r.papel === 'alvo' || r.papel === 'vitima') && (r.k === 'jogador' ? r.id === eu : r.ctl === eu));
  if (!minha) return false;
  if (l.actor === eu && (l.kind === 'conjura' || l.kind === 'ativa' || l.kind === 'ataque' || l.kind === 'bloqueio')) return false;
  return true;
}

/** rótulo da etapa no registro (as etapas do combate viram uma só) */
export function rotuloEtapa(s: Step | null | undefined): string | null {
  switch (s) {
    case 'untap': return 'Desvirar';
    case 'upkeep': return 'Manutenção';
    case 'draw': return 'Compra';
    case 'main1': return 'Principal 1';
    case 'beginCombat': case 'declareAttackers': case 'declareBlockers': case 'firstStrikeDamage': case 'combatDamage': case 'endCombat': return 'Combate';
    case 'main2': return 'Principal 2';
    case 'end': case 'cleanup': return 'Final';
    default: return null;
  }
}

/** a rodada de uma linha (as de checkpoint antigo não têm: pelo turno) */
export function rodadaDe(l: Pick<LogLinhaView, 'round' | 'turn'>, jogadores: number): number {
  return l.round ?? Math.max(1, Math.ceil(l.turn / Math.max(1, jogadores)));
}

/**
 * Junta as linhas do motor com as de sistema da sala. Cada linha de sistema entra logo depois da linha do motor com
 * seq `apos` (a última que existia quando ela aconteceu); se essa linha já saiu da janela da vista, entra no começo.
 */
export function intercalar(log: LogLinhaView[], sistema: LinhaSistema[], jogadores: number): LinhaReg[] {
  const out: LinhaReg[] = [];
  const doMotor = (l: LogLinhaView): LinhaReg => ({ chave: String(l.seq), categoria: categoria(l), log: l, sistema: null, turn: l.turn, round: rodadaDe(l, jogadores), step: l.step ?? null });
  const daSala = (s: LinhaSistema, ref: LinhaReg | undefined): LinhaReg => ({ chave: `s${s.id}`, categoria: 'sistema', log: null, sistema: s, turn: ref?.turn ?? 0, round: ref?.round ?? 0, step: ref?.step ?? null });
  const fila = [...sistema].sort((a, b) => a.apos - b.apos || a.id - b.id);
  let k = 0;
  const primeiro = log[0]?.seq ?? Infinity;
  // as que vieram antes da janela
  while (k < fila.length && fila[k].apos < primeiro && log.length) { out.push(daSala(fila[k], log.length ? doMotor(log[0]) : undefined)); k++; }
  for (const l of log) {
    const r = doMotor(l);
    out.push(r);
    while (k < fila.length && fila[k].apos <= l.seq) { out.push(daSala(fila[k], r)); k++; }
  }
  const ult = out[out.length - 1];
  while (k < fila.length) { out.push(daSala(fila[k], ult)); k++; }
  return out;
}

export interface Filtros {
  /** categorias marcadas (vazio: todas) */
  categorias: ReadonlySet<Categoria>;
  /** jogadores marcados (vazio: todos) */
  jogadores: ReadonlySet<number>;
  /** só o que afetou você */
  comigo: boolean;
  /** busca já normalizada (sem acentos, minúscula); vazia: tudo */
  termo: string;
}

export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** a linha passa pelos filtros; `texto` é o texto mostrado (para a busca) */
export function passa(l: LinhaReg, f: Filtros, eu: number | null, texto: string): boolean {
  if (f.categorias.size && !f.categorias.has(l.categoria)) return false;
  if (f.jogadores.size && ![...f.jogadores].some((p) => envolve(l, p))) return false;
  if (f.comigo && !(l.log && afetou(l.log, eu))) return false;
  if (f.termo && !normalizar(`${texto} ${l.log?.rule ?? ''}`).includes(f.termo)) return false;
  return true;
}

export interface BlocoEtapa<T> { chave: string; etapa: string | null; linhas: T[] }
export interface BlocoVez<T> { chave: string; turno: number; vez: number | null; etapas: BlocoEtapa<T>[] }
export interface BlocoRodada<T> { chave: string; rodada: number; vezes: BlocoVez<T>[] }

/**
 * A árvore rodada → vez → etapa. `vezDe` diz de quem é cada turno (pelas linhas de começo de turno, antes dos
 * filtros). Um turno que aparece de novo mais adiante (não deveria) ganha outro bloco, com chave própria.
 */
export function agrupar<T extends { turn: number; round: number; step: Step | null }>(linhas: T[], vezDe: (turno: number) => number | null): BlocoRodada<T>[] {
  const rodadas: BlocoRodada<T>[] = [];
  const usadas = new Map<string, number>();
  const chaveUnica = (base: string) => { const n = usadas.get(base) ?? 0; usadas.set(base, n + 1); return n ? `${base}-${n}` : base; };
  for (const l of linhas) {
    const rodada = l.turn === 0 ? 0 : l.round;
    let r = rodadas[rodadas.length - 1];
    if (!r || r.rodada !== rodada) { r = { chave: chaveUnica(`r${rodada}`), rodada, vezes: [] }; rodadas.push(r); }
    let v = r.vezes[r.vezes.length - 1];
    if (!v || v.turno !== l.turn) { v = { chave: chaveUnica(`t${l.turn}`), turno: l.turn, vez: l.turn === 0 ? null : vezDe(l.turn), etapas: [] }; r.vezes.push(v); }
    // antes da 1ª rodada (ordem dos assentos, mulligans) não há etapa de verdade
    const etapa = l.turn === 0 ? null : rotuloEtapa(l.step);
    let e = v.etapas[v.etapas.length - 1];
    if (!e || e.etapa !== etapa) { e = { chave: chaveUnica(`${v.chave}:${etapa ?? '-'}`), etapa, linhas: [] }; v.etapas.push(e); }
    e.linhas.push(l);
  }
  return rodadas;
}

/** título de uma rodada e de uma vez, como na janela e no texto copiado */
export const tituloRodada = (r: number) => (r === 0 ? 'Antes da 1ª rodada' : `Rodada ${r}`);
export const tituloVez = (nome: string | null) => (nome ? `Vez de ${nome}` : null);

/** o registro filtrado como texto simples, com os cabeçalhos, para colar numa conversa */
export function textoParaCopiar<T extends { turn: number; round: number; step: Step | null }>(rodadas: BlocoRodada<T>[], nome: (p: number) => string | null, texto: (l: T) => string): string {
  const out: string[] = [];
  for (const r of rodadas) {
    out.push(`== ${tituloRodada(r.rodada)} ==`);
    for (const v of r.vezes) {
      const tv = v.vez !== null ? tituloVez(nome(v.vez)) : null;
      if (tv) out.push(`-- ${tv} --`);
      for (const e of v.etapas) {
        if (e.etapa) out.push(`[${e.etapa}]`);
        for (const l of e.linhas) out.push(`  ${texto(l)}`);
      }
    }
    out.push('');
  }
  return out.join('\n').trimEnd() + '\n';
}
