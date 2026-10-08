// Contexto do motor: o estado serializável mais caches derivados (características calculadas).
// Todo código do motor e das cartas recebe um G.

import type { Chars, GameObject, GameState, LogEntry, ObjId, PlayerId, PlayerState, ZoneName } from './types.ts';
import type { ActiveStatic } from './chars.ts';

export class G {
  state: GameState;
  /** cache das características dos permanentes, válido para state.version */
  derived: { version: number; chars: Map<ObjId, Chars>; statics: ActiveStatic[] } | null = null;
  /** durante o cálculo das camadas, características parciais */
  computing: Map<ObjId, Chars> | null = null;
  /** estatísticas de desempenho/depuração */
  counters = { charsComputations: 0 };

  constructor(state: GameState) {
    this.state = state;
  }

  bump(): void {
    this.state.version++;
  }

  obj(id: ObjId): GameObject {
    const o = this.state.objects[id];
    if (!o) throw new Error(`Objeto inexistente: ${id}`);
    return o;
  }

  tryObj(id: ObjId | null | undefined): GameObject | null {
    if (id === null || id === undefined) return null;
    return this.state.objects[id] ?? null;
  }

  player(id: PlayerId): PlayerState {
    return this.state.players[id];
  }

  /** jogadores ainda na partida, em ordem de turno a partir do ativo (APNAP, CR 101.4) */
  apnap(): PlayerId[] {
    const order = this.state.turnOrder;
    const start = order.indexOf(this.state.turn.active);
    const out: PlayerId[] = [];
    for (let i = 0; i < order.length; i++) {
      const p = order[(start + i) % order.length];
      if (!this.state.players[p].left) out.push(p);
    }
    return out;
  }

  inGame(p: PlayerId): boolean {
    return !this.state.players[p].left;
  }

  playersInGame(): PlayerId[] {
    return this.state.turnOrder.filter((p) => !this.state.players[p].left);
  }

  /** próximo jogador na ordem de turno ainda na partida (CR 117.3d, 800.4j) */
  nextPlayer(p: PlayerId): PlayerId {
    const order = this.state.turnOrder;
    const i = order.indexOf(p);
    for (let k = 1; k <= order.length; k++) {
      const q = order[(i + k) % order.length];
      if (!this.state.players[q].left) return q;
    }
    return p;
  }

  /**
   * Oponentes de um jogador. Em todos contra todos, todo outro jogador na partida
   * (CR 102.2-102.3). Função única, para o 2x2 (CR 808, 810) mudar só aqui.
   */
  opponents(p: PlayerId): PlayerId[] {
    return this.playersInGame().filter((q) => q !== p && !this.teammates(p).includes(q));
  }

  teammates(_p: PlayerId): PlayerId[] {
    return [];
  }

  isOpponent(a: PlayerId, b: PlayerId): boolean {
    return a !== b && this.opponents(a).includes(b);
  }

  zoneOf(p: PlayerId, zone: ZoneName): ObjId[] {
    const z = this.state.zones;
    switch (zone) {
      case 'library': return z.library[p];
      case 'hand': return z.hand[p];
      case 'graveyard': return z.graveyard[p];
      default: return z[zone];
    }
  }

  battlefield(): ObjId[] {
    return this.state.zones.battlefield;
  }

  log(text: string, opts: Partial<Omit<LogEntry, 'text' | 'turn'>> = {}): void {
    this.state.log.push({ turn: this.state.turn.number, text, visibleTo: opts.visibleTo ?? null, hiddenText: opts.hiddenText, rule: opts.rule });
  }

  get turnNumber(): number {
    return this.state.turn.number;
  }

  get active(): PlayerId {
    return this.state.turn.active;
  }
}
