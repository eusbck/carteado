// A fila de quadros (protocolo-2): cada vista que o servidor manda vira um quadro, e a mesa mostra um de cada vez. O
// quadro seguinte só entra quando as animações do atual acabaram (o tempo que Efeitos.tsx informa, com teto), então as
// jogadas seguidas dos bots aparecem na ordem em vez de uma animação cortar a outra.
//
// Saltos (a fila vai direto ao último quadro, sem esperar):
// - vista que não continua a anterior (`reinicio`: conectar, partida nova, desfazer), modo Desempenho, aba escondida;
// - fila atrasada: mais de MAX_FILA quadros esperando, ou o mais antigo esperando há mais de ATRASO_MAX;
// - um quadro com decisão sua não espera mais que TETO_DECISAO (1,2 s) depois de chegar (os de antes dele são pulados,
//   e as animações que eles já começaram seguem na camada dos efeitos);
// - pular() (clique na mesa ou Espaço).
//
// O estado da cena (para a Mesa e o zoom) fica em cenaLoja.ts; esta classe não conhece a loja nem o DOM (testes com
// relógio falso em testes/fila-quadros.test.ts).

/** o que a fila precisa saber de cada quadro */
export interface Quadro {
  /** quando chegou (ms do relógio da fila) */
  chegada: number;
  /** traz uma decisão sua: tem o teto TETO_DECISAO */
  decisao: boolean;
}

export interface Relogio {
  agora(): number;
  depois(f: () => void, ms: number): unknown;
  cancelar(t: unknown): void;
}

const relogioPadrao: Relogio = {
  agora: () => performance.now(),
  depois: (f, ms) => setTimeout(f, ms),
  cancelar: (t) => clearTimeout(t as ReturnType<typeof setTimeout>),
};

/** teto das animações de um quadro: o seguinte entra no máximo nisso, diga Efeitos o que disser. Maior que o da
 * decisão: uma destruição em massa (N1) dura até ~2,4 s, e o quadro seguinte não pode cortá-la (meta: zero animações
 * cortadas). A decisão não espera tanto: ela tem o TETO_DECISAO, contado da chegada */
export const TETO_QUADRO = 2600;
/** o quadro com decisão sua vira o atual, e a cena dele acaba, no máximo isso depois de chegar */
export const TETO_DECISAO = 1200;
/** quadros esperando além disso: salta para o último */
export const MAX_FILA = 3;
/** o mais antigo esperando há mais disso: salta para o último */
export const ATRASO_MAX = 2000;
/** sem notícia de Efeitos (a mesa não desenhou: vista igual, outra tela), o quadro acaba nisso */
export const SEM_NOTICIA = 150;

export class FilaQuadros<Q extends Quadro> {
  private espera: Q[] = [];
  /** o quadro cuja cena está rodando (null: a mesa está parada) */
  private atual: Q | null = null;
  /** o atual ainda não recebeu a duração das animações dele (só a primeira notícia vale) */
  private semDuracao = false;
  private fimCena: unknown = null;
  private tetos = new Set<unknown>();

  /**
   * `aplicar` mostra o quadro (muda a loja) e devolve se a vista mudou de fato (sem mudança, nada vai animar e a cena
   * acaba na hora); `marcar` recebe os quadros esperando e se o atual anima (cenaLoja.marcarCena).
   */
  constructor(private aplicar: (q: Q) => boolean, private marcar: (fila: number, animando: boolean) => void = () => {}, private r: Relogio = relogioPadrao) {}

  /** chegou um quadro; `saltar`: mostra já, sem cena e sem os que esperavam */
  receber(q: Q, saltar = false): void {
    if (saltar) {
      this.espera = [];
      this.encerrar();
      this.aplicar(q);
      this.avisar();
      return;
    }
    this.espera.push(q);
    if (q.decisao) {
      const t = this.r.depois(() => { this.tetos.delete(t); this.alcancar(q); }, Math.max(0, q.chegada + TETO_DECISAO - this.r.agora()));
      this.tetos.add(t);
    }
    if (this.atual) this.avisar();
    else this.proximo();
  }

  /** Efeitos.tsx: as animações do quadro atual duram `ms` (só a primeira notícia de cada quadro vale) */
  duracao(ms: number): void {
    if (!this.atual || !this.semDuracao) return;
    this.semDuracao = false;
    this.pararFim();
    const espera = Math.min(TETO_QUADRO, Math.max(0, Number.isFinite(ms) ? ms : 0));
    if (espera <= 0) this.proximo();
    else this.fimCena = this.r.depois(() => { this.fimCena = null; this.proximo(); }, espera);
  }

  /** mostra o último quadro que chegou e encerra a cena na hora */
  pular(): void {
    const ultimo = this.espera.pop();
    this.espera = [];
    this.encerrar();
    if (ultimo) this.aplicar(ultimo);
    this.avisar();
  }

  /** esquece tudo (saiu da sala, a partida acabou de vez) */
  limpar(): void {
    this.espera = [];
    this.encerrar();
    for (const t of this.tetos) this.r.cancelar(t);
    this.tetos.clear();
    this.avisar();
  }

  /** quadros esperando, contando o atual que anima (o data-fila) */
  get pendentes(): number { return this.espera.length + (this.atual ? 1 : 0); }

  private proximo(): void {
    this.pararFim();
    this.atual = null;
    this.semDuracao = false;
    if (!this.espera.length) { this.avisar(); return; }
    const agora = this.r.agora();
    // atrasada demais: os do meio saem, o último entra (a diferença inteira anima de uma vez)
    if (this.espera.length > MAX_FILA || agora - this.espera[0].chegada > ATRASO_MAX) this.espera = this.espera.slice(-1);
    const q = this.espera.shift()!;
    this.atual = q;
    this.semDuracao = true;
    this.avisar();
    const mudou = this.aplicar(q);
    // aplicar pode ter levado a outro quadro (a notícia veio na hora, dentro do desenho)
    if (this.atual !== q || !this.semDuracao) return;
    if (!mudou) { this.proximo(); return; }
    this.fimCena = this.r.depois(() => { this.fimCena = null; if (this.atual === q && this.semDuracao) this.proximo(); }, SEM_NOTICIA);
  }

  /** o teto do quadro com decisão: ele vira o atual (os de antes saem) e a cena dele acaba */
  private alcancar(q: Q): void {
    const i = this.espera.indexOf(q);
    if (i >= 0) {
      this.espera = this.espera.slice(i + 1);
      this.encerrar();
      this.aplicar(q);
      // os que chegaram depois dele seguem a fila
      if (this.espera.length) this.proximo(); else this.avisar();
    } else if (this.atual === q) {
      this.proximo();
    }
  }

  private encerrar(): void {
    this.pararFim();
    this.atual = null;
    this.semDuracao = false;
  }

  private pararFim(): void {
    if (this.fimCena !== null) { this.r.cancelar(this.fimCena); this.fimCena = null; }
  }

  private avisar(): void {
    this.marcar(this.espera.length, this.atual !== null);
  }
}
