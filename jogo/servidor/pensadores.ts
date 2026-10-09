// Threads de pensar dos bots (fase 9, item 4.3). O limite é global: todos os bots de todas as salas dividem estas
// threads (2, por padrão); se houver mais bots pensando do que threads livres, eles esperam a vez numa fila.
// A linha principal do servidor só monta a tarefa (checkpoint + entradas) e recebe a resposta: a mesa e os cliques
// nunca congelam enquanto um bot pensa.

import { Worker } from 'node:worker_threads';
import type { EstadoBot } from '../bots/heuristico.ts';
import { PARAMETROS } from '../bots/niveis.ts';
import type { Tarefa } from '../bots/pensar.ts';
import type { Checkpoint, Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer } from '../motor/types.ts';

/** quanto a vigia espera além do teto de tempo da decisão antes de encerrar uma thread presa */
export const FOLGA_VIGIA = 10_000;

export type MsgPensar =
  | { t: 'pensar'; id: number; sala: string; geracao: number; base: Checkpoint | null; desde: number | null; entradas: Input[]; listas: DeckList[]; tarefa: Omit<Tarefa, 'cp' | 'entradas'> }
  | { t: 'esquecer'; sala: string };

export type RespPensar =
  | { id: number; erro: string }
  | { id: number; erro?: undefined; resposta: Answer | null; estado: EstadoBot; cpIndice: number | null; ms: number; memoria: number };

export interface PedidoPensar {
  sala: string;
  /** muda quando a partida é refeita (desfazer): o que as threads guardaram da sala deixa de valer */
  geracao: number;
  /** o checkpoint mais recente que a sala tem (começo do turno ou o salvo de tempos em tempos), se houver */
  cp: Checkpoint | null;
  /** todas as entradas da partida até agora */
  entradas: Input[];
  /** listas dos decks da partida (as guardadas quando ela começou) */
  listas: DeckList[];
  tarefa: Omit<Tarefa, 'cp' | 'entradas'>;
}

export interface Pensado {
  resposta: Answer | null;
  estado: EstadoBot;
  ms: number;
}

interface Trabalhador {
  w: Worker;
  tarefa: { id: number; pedido: PedidoPensar; ok: (r: Pensado | null) => void; falha: (e: Error) => void; reenviada: boolean; desde: number; inicio: number; vigia?: ReturnType<typeof setTimeout> } | null;
  /** o que esta thread guardou de cada sala */
  cache: Map<string, { geracao: number; indice: number }>;
  memoria: number;
}

export class Pensadores {
  readonly threads: number;
  private ts: Trabalhador[] = [];
  private fila: { id: number; pedido: PedidoPensar; ok: (r: Pensado | null) => void; falha: (e: Error) => void; desde: number }[] = [];
  private seq = 0;
  private fechado = false;
  /** maior memória usada pelas threads juntas (bytes do heap), para as medições */
  picoMemoria = 0;
  /** tempo de cada decisão pensada, por nível (só o pensar; a espera na fila à parte) */
  estatisticas: Record<string, { n: number; soma: number; max: number; espera: number; esperaMax: number }> = {};

  /** o script das threads (testes: uma thread de mentira) */
  private script: URL;
  /** quanto além do teto de tempo da decisão a vigia espera antes de encerrar a thread */
  private folga: number;

  constructor(threads = 2, opcoes: { script?: URL; folga?: number } = {}) {
    this.threads = threads;
    this.script = opcoes.script ?? new URL('./pensador.ts', import.meta.url);
    this.folga = opcoes.folga ?? FOLGA_VIGIA;
    // as threads carregam as cartas logo ao subir o servidor, e não na primeira vez que um bot pensa
    for (let i = 0; i < threads; i++) this.ts.push(this.criar());
  }

  private criar(): Trabalhador {
    // teto de memória por thread: duas threads ficam abaixo de ~1 GB juntas
    const w = new Worker(this.script, { resourceLimits: { maxOldGenerationSizeMb: 448 } });
    const t: Trabalhador = { w, tarefa: null, cache: new Map(), memoria: 0 };
    w.on('message', (r: RespPensar) => this.recebeu(t, r));
    w.on('error', (e: unknown) => this.caiu(t, e instanceof Error ? e : new Error(String(e))));
    w.on('exit', (code) => { if (!this.fechado && code !== 0) this.caiu(t, new Error(`thread de pensar saiu com código ${code}`)); });
    w.unref();
    return t;
  }

  private caiu(t: Trabalhador, e: Error): void {
    const i = this.ts.indexOf(t);
    if (i < 0) return;
    this.ts.splice(i, 1);
    if (t.tarefa?.vigia) clearTimeout(t.tarefa.vigia);
    t.tarefa?.falha(e);
    t.tarefa = null;
    void t.w.terminate();
    this.despachar();
  }

  /** pensa uma decisão; null se a partida refeita não chegou nela (algo mudou) */
  pensar(pedido: PedidoPensar): Promise<Pensado | null> {
    if (this.fechado) return Promise.reject(new Error('threads de pensar fechadas'));
    return new Promise((ok, falha) => {
      this.fila.push({ id: ++this.seq, pedido, ok, falha, desde: performance.now() });
      this.despachar();
    });
  }

  /** tira da fila as tarefas de uma sala que ainda não começaram (desfazer, concessão, sala fechada) */
  cancelar(sala: string): void {
    for (const f of this.fila.filter((x) => x.pedido.sala === sala)) f.ok(null);
    this.fila = this.fila.filter((x) => x.pedido.sala !== sala);
  }

  /** quantos bots estão pensando agora e quantos esperam a vez */
  get ocupacao(): { pensando: number; esperando: number } {
    return { pensando: this.ts.filter((t) => t.tarefa).length, esperando: this.fila.length };
  }

  private despachar(): void {
    while (this.fila.length) {
      if (this.ts.length < this.threads) this.ts.push(this.criar());
      const livres = this.ts.filter((t) => !t.tarefa);
      if (!livres.length) return;
      const f = this.fila.shift()!;
      // de preferência a thread que já tem a sala guardada (refaz menos)
      const t = livres.find((x) => this.cacheServe(x, f.pedido) !== null) ?? livres[0];
      t.tarefa = { ...f, reenviada: false, inicio: performance.now() };
      this.vigiar(t);
      this.enviar(t, false);
    }
  }

  /**
   * Vigia da tarefa: passou do teto de tempo da decisão (o do nível, ou o pedido) mais a folga, a thread está presa
   * (um laço numa carta, por exemplo). Ela é encerrada e recriada, e a tarefa falha: o bot joga a resposta padrão
   * (salas.ts, pensarBot) e a mesa segue.
   */
  private vigiar(t: Trabalhador): void {
    const tarefa = t.tarefa!;
    const pt = tarefa.pedido.tarefa;
    const prazo = (pt.tempo ?? PARAMETROS[pt.nivel]?.tempo ?? 6000) + this.folga;
    tarefa.vigia = setTimeout(() => {
      if (t.tarefa !== tarefa) return;
      console.error(`[sala ${tarefa.pedido.sala}] a thread de pensar passou de ${prazo} ms numa decisão; foi encerrada e recriada`);
      this.caiu(t, new Error(`a thread de pensar passou de ${prazo} ms`));
    }, prazo);
    tarefa.vigia.unref();
  }

  private cacheServe(t: Trabalhador, p: PedidoPensar): number | null {
    const c = t.cache.get(p.sala);
    if (!c || c.geracao !== p.geracao || c.indice > p.entradas.length) return null;
    if (p.cp && c.indice < p.cp.inputIndex) return null; // o da sala é mais novo
    return c.indice;
  }

  private enviar(t: Trabalhador, semCache: boolean): void {
    const { id, pedido: p } = t.tarefa!;
    const desde = semCache ? null : this.cacheServe(t, p);
    const m: MsgPensar = desde !== null
      ? { t: 'pensar', id, sala: p.sala, geracao: p.geracao, base: null, desde, entradas: p.entradas.slice(desde), listas: p.listas, tarefa: p.tarefa }
      : { t: 'pensar', id, sala: p.sala, geracao: p.geracao, base: p.cp, desde: null, entradas: p.entradas.slice(p.cp?.inputIndex ?? 0), listas: p.listas, tarefa: p.tarefa };
    t.w.postMessage(m);
  }

  private recebeu(t: Trabalhador, r: RespPensar): void {
    const tarefa = t.tarefa;
    if (!tarefa || tarefa.id !== r.id) return;
    if (r.erro === 'sem-base' && !tarefa.reenviada) {
      tarefa.reenviada = true;
      t.cache.delete(tarefa.pedido.sala);
      this.enviar(t, true);
      return;
    }
    t.tarefa = null;
    if (tarefa.vigia) clearTimeout(tarefa.vigia);
    if (r.erro !== undefined) tarefa.falha(new Error(r.erro));
    else {
      if (r.cpIndice !== null) t.cache.set(tarefa.pedido.sala, { geracao: tarefa.pedido.geracao, indice: r.cpIndice });
      t.memoria = r.memoria;
      const e = (this.estatisticas[tarefa.pedido.tarefa.nivel] ??= { n: 0, soma: 0, max: 0, espera: 0, esperaMax: 0 });
      const espera = tarefa.inicio - tarefa.desde;
      e.n++; e.soma += r.ms; e.max = Math.max(e.max, r.ms); e.espera += espera; e.esperaMax = Math.max(e.esperaMax, espera);
      this.picoMemoria = Math.max(this.picoMemoria, this.ts.reduce((s, x) => s + x.memoria, 0));
      tarefa.ok({ resposta: r.resposta, estado: r.estado, ms: r.ms });
    }
    this.despachar();
  }

  /** a sala acabou ou foi apagada: as threads esquecem o que guardaram dela */
  esquecer(sala: string): void {
    this.cancelar(sala);
    for (const t of this.ts) { t.cache.delete(sala); t.w.postMessage({ t: 'esquecer', sala } satisfies MsgPensar); }
  }

  async fechar(): Promise<void> {
    this.fechado = true;
    for (const f of this.fila) f.ok(null);
    this.fila = [];
    await Promise.all(this.ts.map((t) => t.w.terminate()));
    this.ts = [];
  }
}
