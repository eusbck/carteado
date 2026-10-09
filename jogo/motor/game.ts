// Condutor da partida: liga o laço principal (gerador) às respostas dos jogadores.
// Uma partida é determinada por (configuração, decks, entradas). Entradas são respostas
// validadas e concessões; reproduzi-las a partir da semente recria o mesmo estado.

import { defaultAnswer, validateShape, type LiveDecision } from './ask.ts';
import type { Gen } from './defs.ts';
import { G } from './game-context.ts';
import { createGameState, type DeckList } from './state.ts';
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

  private constructor(state: GameState, decks: DeckList[], inputs: Input[] = []) {
    this.g = new G(state);
    this.decks = decks;
    this.inputs = inputs;
    this.gen = mainLoop(this.g);
    this.step(undefined);
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
    const state = structuredClone(cp.state);
    state.decisionSeq = Math.max(0, state.decisionSeq - 1); // a decisão pendente é refeita
    const game = new Game(state, decks, allInputs.slice(0, cp.inputIndex));
    for (const inp of allInputs.slice(cp.inputIndex)) game.applyInput(inp, true);
    return game;
  }

  get state(): GameState {
    return this.g.state;
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
      this.step(inp.a);
      this.inputs.push(inp);
    } else {
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
   * entraram e o erro da seguinte. Um checkpoint que não vale mais é deixado de lado (refaz do começo).
   */
  static replayAteFalhar(config: GameConfig, decks: DeckList[], inputs: Input[], cp: Checkpoint | null = null): { game: Game; aplicadas: number; erro: Error | null } {
    let base = cp && cp.inputIndex <= inputs.length ? cp : null;
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
    return { state: structuredClone(this.state), inputIndex: this.inputs.length };
  }

  /** cópia independente da partida, para simulação dos bots */
  fork(): Game {
    const cp = this.checkpoint();
    if (cp) {
      const state = cp.state;
      state.decisionSeq = Math.max(0, state.decisionSeq - 1);
      const game = new Game(state, this.decks, []);
      return game;
    }
    return Game.replay(this.state.config, this.decks, this.inputs);
  }

  pendingDecision(): Decision | null {
    return this.pending;
  }
}
