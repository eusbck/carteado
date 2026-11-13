// Condutor da partida: liga o laço principal (gerador) às respostas dos jogadores.
// Uma partida é determinada por (configuração, decks, entradas). Entradas são respostas
// validadas e concessões; reproduzi-las a partir da semente recria o mesmo estado.

import { defaultAnswer, validateShape, type LiveDecision } from './ask.ts';
import type { Gen } from './defs.ts';
import { G } from './game-context.ts';
import { novoDiario } from './diario.ts';
import { cloneState, createGameState, type DeckList } from './state.ts';
import { concede as doConcede, mainLoop } from './turn.ts';
import type { Answer, Decision, GameConfig, GameState, PlayerId } from './types.ts';
import './builtin.ts';

export type Input =
  | { t: 'a'; p: PlayerId; d: number; a: Answer }
  | { t: 'concede'; p: PlayerId };

export interface Checkpoint {
  state: GameState;
  /** quantas entradas já estavam aplicadas quando o estado foi salvo */
  inputIndex: number;
}

export class Game {
  g: G;
  private gen: Gen<void>;
  pending: LiveDecision | null = null;
  inputs: Input[] = [];
  readonly decks: DeckList[];
  error: Error | null = null;
  /**
   * De onde a partida se refaz: o estado é `fromCheckpoint(cpOrigem, prefixo + inputs)` (ou, sem checkpoint, o replay
   * de `prefixo + inputs` desde a configuração). O fork de um checkpoint começa com `inputs` vazio e herda no
   * `prefixo` as entradas de quem o criou; `prefixo.length` é também a base da contagem `entrada` do registro (R1).
   */
  private cpOrigem: Checkpoint | null = null;
  private prefixo: Input[] = [];

  private constructor(state: GameState, decks: DeckList[], inputs: Input[] = [], origem?: { cp: Checkpoint | null; prefixo: Input[] }) {
    this.g = new G(state);
    this.decks = decks;
    this.inputs = inputs;
    if (origem) { this.cpOrigem = origem.cp; this.prefixo = origem.prefixo; }
    this.gen = mainLoop(this.g);
    this.marcaEntrada();
    this.step(undefined);
  }

  /** R1: o índice da próxima entrada (contando as que vieram antes de um fork) */
  get entradaAtual(): number {
    return this.prefixo.length + this.inputs.length;
  }

  /** R1: as linhas do registro gravadas a partir daqui são da entrada de índice `inputs.length` */
  private marcaEntrada(): void {
    this.g.entrada = this.entradaAtual;
  }

  static create(config: GameConfig, decks: DeckList[]): Game {
    return new Game(createGameState(config, decks), decks);
  }

  /** começa a partida a partir de um estado já montado (testes, checkpoints) */
  static fromState(state: GameState, decks: DeckList[] = []): Game {
    return new Game(state, decks);
  }

  /** recria a partida aplicando as entradas desde o início (reprodução por semente) */
  static replay(config: GameConfig, decks: DeckList[], inputs: Input[]): Game {
    const game = new Game(createGameState(config, decks), decks);
    for (const inp of inputs) game.applyInput(inp, true);
    return game;
  }

  /** retoma de um checkpoint (estado salvo numa decisão de prioridade) mais as entradas seguintes */
  static fromCheckpoint(cp: Checkpoint, decks: DeckList[], allInputs: Input[]): Game {
    // o checkpoint continua valendo (o servidor e os bots refazem dele de novo): a partida trabalha numa cópia, com a
    // LKI compartilhada
    const state = cloneState(cp.state);
    state.decisionSeq = Math.max(0, state.decisionSeq - 1); // a decisão pendente é refeita
    // o checkpoint continua intacto (a partida usa a cópia): serve de origem para o fork fora de prioridade
    const game = new Game(state, decks, allInputs.slice(0, cp.inputIndex), { cp, prefixo: [] });
    for (const inp of allInputs.slice(cp.inputIndex)) game.applyInput(inp, true);
    return game;
  }

  get state(): GameState {
    return this.g.state;
  }

  /**
   * F1: liga o diário de eventos (motor/diario.ts) nesta partida; só o Game da sala chama. Fica em `this.g`, fora do
   * estado: checkpoint, `fork()` e as partidas refeitas (replay, fromCheckpoint) nascem com um G novo, sem diário, e
   * quem refaz precisa ligar de novo. Ligar de novo numa partida que já tem diário não faz nada (os cursores seguem).
   */
  ligarDiario(teto?: number): void {
    this.g.diario ??= novoDiario(teto);
  }

  private step(answer: Answer | undefined): void {
    try {
      const r = this.gen.next(answer as Answer);
      this.pending = r.done ? null : (r.value as LiveDecision);
    } catch (e) {
      this.error = e as Error;
      this.pending = null;
      throw e;
    }
  }

  /** valida a resposta sem aplicá-la */
  check(player: PlayerId, answer: Answer): string | null {
    const d = this.pending;
    if (!d) return 'Nenhuma decisão pendente';
    if (d.player !== player) return 'Não é sua decisão';
    const shape = validateShape(d, answer);
    if (shape) return shape;
    return d.validate ? d.validate(answer) : null;
  }

  answer(player: PlayerId, answer: Answer): { ok: true } | { ok: false; error: string } {
    const err = this.check(player, answer);
    if (err) return { ok: false, error: err };
    this.applyInput({ t: 'a', p: player, d: this.pending!.id, a: answer }, false);
    return { ok: true };
  }

  concede(player: PlayerId): void {
    if (this.state.players[player]?.left || this.state.gameOver) return;
    this.applyInput({ t: 'concede', p: player }, false);
  }

  // a entrada só entra na lista depois que o motor a aplicou: uma que derruba o motor (exceção no meio do passo) não
  // fica gravada, e a partida se refaz das entradas que ficaram (o servidor faz isso: salas.ts, falha)
  private applyInput(inp: Input, replaying: boolean): void {
    if (inp.t === 'a') {
      if (!this.pending) throw new Error('Entrada sem decisão pendente');
      if (replaying) {
        const err = this.check(inp.p, inp.a);
        if (err) throw new Error(`Reprodução divergiu: ${err}`);
      }
      this.marcaEntrada();
      this.step(inp.a);
      this.inputs.push(inp);
    } else {
      this.marcaEntrada();
      doConcede(this.g, inp.p);
      // se a decisão pendente era de quem saiu, responde por ele (CR 800.4g-h)
      while (this.pending && this.state.players[this.pending.player]?.left) this.step(defaultAnswer(this.pending));
      if (this.state.gameOver) this.pending = null;
      this.inputs.push(inp);
    }
  }

  /**
   * Como replay e fromCheckpoint, mas para na primeira entrada que não dá para aplicar (uma partida salva com uma
   * entrada que o motor de agora recusa ou que o derruba): devolve a partida até a última entrada boa, quantas
   * entraram e o erro da seguinte. Um checkpoint que não dá para retomar é deixado de lado (refaz do começo); um com
   * mais entradas do que as gravadas vale como antes (o estado dele manda: salas montadas nos testes).
   */
  static replayAteFalhar(config: GameConfig, decks: DeckList[], inputs: Input[], cp: Checkpoint | null = null): { game: Game; aplicadas: number; erro: Error | null } {
    let base = cp;
    let game: Game | null = null;
    if (base) {
      try { game = Game.fromCheckpoint(base, decks, inputs.slice(0, base.inputIndex)); } catch { base = null; }
    }
    game ??= Game.create(config, decks);
    for (let k = game.inputs.length; k < inputs.length; k++) {
      try {
        game.applyInput(inputs[k], true);
      } catch (e) {
        // recusada antes de andar (divergiu, nada pendente): a partida está inteira na entrada k. O motor quebrou no
        // meio do passo: o laço morreu com o estado pela metade, e a partida se refaz até a anterior
        if (game.error) game = base ? Game.fromCheckpoint(base, decks, inputs.slice(0, k)) : Game.replay(config, decks, inputs.slice(0, k));
        return { game, aplicadas: k, erro: e instanceof Error ? e : new Error(String(e)) };
      }
    }
    return { game, aplicadas: inputs.length, erro: null };
  }

  isOver(): boolean {
    return !!this.state.gameOver;
  }

  /** checkpoint possível só numa decisão de prioridade (o laço é retomável ali) */
  checkpoint(): Checkpoint | null {
    if (!this.pending || this.pending.kind !== 'priority') return null;
    return { state: cloneState(this.state), inputIndex: this.inputs.length };
  }

  /** cópia independente da partida, para simulação dos bots */
  fork(): Game {
    const cp = this.checkpoint();
    if (cp) {
      const state = cp.state;
      state.decisionSeq = Math.max(0, state.decisionSeq - 1);
      const game = new Game(state, this.decks, [], { cp: this.cpOrigem, prefixo: this.prefixo.concat(this.inputs) });
      return game;
    }
    // fora de uma decisão de prioridade o laço não é retomável: refaz da origem com todas as entradas (a contagem
    // `entrada` sai a mesma). Uma partida cujo estado foi mexido por fora do motor depois de criada (os mundos dos bots,
    // com as cartas escondidas sorteadas de novo: bots/mundo.ts) não se refaz assim: a cópia voltaria ao estado
    // verdadeiro, com o que estava escondido. Por isso a cópia refeita tem de sair igual à partida; se não sair, ela é
    // descartada e o fork falha (só custa neste caminho; o fork numa decisão de prioridade copia o estado)
    // (as entradas do mundo podem nem caber na partida verdadeira: a reprodução diverge, e o erro é o mesmo)
    const todas = this.prefixo.concat(this.inputs);
    const erro = (cause?: unknown) => new Error('fork fora de uma decisão de prioridade: refazer a partida não reproduz o estado atual (alterado por fora do motor, como nos mundos dos bots); a cópia voltaria ao que estava escondido', { cause });
    let nova: Game;
    try {
      nova = this.cpOrigem ? Game.fromCheckpoint(this.cpOrigem, this.decks, todas) : Game.replay(this.state.config, this.decks, todas);
    } catch (e) {
      throw erro(e);
    }
    if (assinatura(nova.state) !== assinatura(this.state)) throw erro();
    return nova;
  }

  pendingDecision(): Decision | null {
    return this.pending;
  }
}

/** o estado inteiro, menos o contador de versão (que só serve ao cache), para comparar uma partida refeita */
function assinatura(s: GameState): string {
  return JSON.stringify({ ...s, version: 0 });
}
