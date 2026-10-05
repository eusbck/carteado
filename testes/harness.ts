// Arcabouço de testes: monta um estado de jogo direto (sem mulligan) e conduz a partida
// por nomes de cartas. As decisões são respondidas por um roteiro de escolhas ou por padrões.

import '../cartas/index.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { chars, controllerOf, nameOf } from '../motor/chars.ts';
import { Game } from '../motor/game.ts';
import { G } from '../motor/game-context.ts';
import { blankObject, createGameState } from '../motor/state.ts';
import { newCombat } from '../motor/combat.ts';
import type { Answer, ChoiceItem, Decision, GameState, ObjId, PlayerId, Step, TargetRef, ZoneName } from '../motor/types.ts';

export interface CardSpec {
  name: string;
  tapped?: boolean;
  counters?: Record<string, number>;
  /** está sob controle desde antes do turno (sem enjoo de invocação); padrão true */
  ready?: boolean;
  commander?: boolean;
  damage?: number;
  attachTo?: string;
  /** é uma ficha: name é o id da ficha registrada em cartas/fichas.ts */
  token?: boolean;
}

type Spec = string | CardSpec;

export interface SetupOptions {
  players?: number;
  multiplayer?: boolean;
  life?: number;
  active?: number;
  step?: Step;
  turn?: number;
  battlefield?: Spec[][];
  hand?: Spec[][];
  library?: Spec[][];
  graveyard?: Spec[][];
  exile?: Spec[][];
  command?: Spec[][];
  seed?: string;
  /** roda antes de responder às primeiras decisões (para roteirizar escolhas iniciais) */
  onStart?: (tg: TestGame) => void;
}

const NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eva', 'Felipe'];

/** uma escolha roteirizada: decide se responde à decisão e como */
export type Scripted = (d: Decision, tg: TestGame) => Answer | null;

export class TestGame {
  game: Game;
  script: Scripted[] = [];
  /** quando true, decisões sem roteiro usam a resposta padrão; senão, o teste falha */
  lenient = true;

  constructor(game: Game) { this.game = game; }

  get g(): G { return this.game.g; }
  get state(): GameState { return this.game.state; }
  get pending(): Decision | null { return this.game.pending; }

  // ------------------------------------------------------------------ consultas
  find(name: string, zone: ZoneName = 'battlefield', player?: PlayerId): ObjId | null {
    const s = this.state;
    const ids: ObjId[] = zone === 'battlefield' || zone === 'stack' || zone === 'exile' || zone === 'command'
      ? s.zones[zone]
      : (player !== undefined ? s.zones[zone][player] : s.zones[zone].flat());
    for (const id of ids) {
      const o = s.objects[id];
      if (player !== undefined && (zone === 'battlefield' ? controllerOf(this.g, id) : o.owner) !== player) continue;
      if (o.def === name || nameOf(this.g, id) === name || (o.copyOf && o.copyOf.def === name)) return id;
    }
    return null;
  }
  all(name: string, zone: ZoneName = 'battlefield'): ObjId[] {
    const s = this.state;
    const ids: ObjId[] = zone === 'battlefield' || zone === 'stack' || zone === 'exile' || zone === 'command' ? s.zones[zone] : s.zones[zone].flat();
    return ids.filter((id) => s.objects[id].def === name || nameOf(this.g, id) === name);
  }
  bf(name: string, player?: PlayerId): ObjId {
    const id = this.find(name, 'battlefield', player);
    if (id === null) throw new Error(`${name} não está no campo`);
    return id;
  }
  names(player: PlayerId, zone: ZoneName): string[] {
    const s = this.state;
    const ids = zone === 'battlefield' ? s.zones.battlefield.filter((id) => controllerOf(this.g, id) === player) : zone === 'exile' || zone === 'command' || zone === 'stack' ? s.zones[zone].filter((id) => s.objects[id].owner === player) : s.zones[zone][player];
    return ids.map((id) => nameOf(this.g, id));
  }
  life(p: PlayerId): number { return this.state.players[p].life; }
  pt(id: ObjId): [number, number] { const c = chars(this.g, id); return [c.power ?? 0, c.toughness ?? 0]; }

  // ------------------------------------------------------------------ respostas
  answer(a: Answer): void {
    const d = this.pending;
    if (!d) throw new Error('Nenhuma decisão pendente');
    const r = this.game.answer(d.player, a);
    if (!r.ok) throw new Error(`Resposta recusada (${d.kind}: ${d.prompt}): ${r.error}`);
  }

  /** responde decisões não-prioridade pelo roteiro ou padrão, até a próxima decisão de prioridade */
  settle(maxSteps = 500): void {
    for (let i = 0; i < maxSteps; i++) {
      const d = this.pending;
      if (!d || d.kind === 'priority') return;
      this.answer(this.respond(d));
    }
    throw new Error('Decisões demais sem chegar à prioridade');
  }

  respond(d: Decision): Answer {
    for (let i = 0; i < this.script.length; i++) {
      const a = this.script[i](d, this);
      if (a) { this.script.splice(i, 1); return a; }
    }
    if (d.kind === 'payment') return { kind: 'payment', auto: true };
    if (!this.lenient) throw new Error(`Decisão sem roteiro: ${d.kind} — ${d.prompt}`);
    return defaultAnswer(d);
  }

  /** próxima decisão do tipo select cujo prompt contém `match`: escolhe itens pelos rótulos */
  choose(match: string | RegExp, labels: (string | number)[]): this {
    this.script.push((d) => {
      if (d.kind !== 'select') return null;
      if (typeof match === 'string' ? !d.prompt.includes(match) : !match.test(d.prompt)) return null;
      const ids: string[] = [];
      const used = new Set<string>();
      for (const l of labels) {
        const it = d.items.find((x) => !used.has(x.id) && !x.disabled && (typeof l === 'number' ? x.obj === l : x.label === l || x.id === l));
        if (!it) throw new Error(`Opção "${l}" não encontrada em: ${d.prompt} [${d.items.map((x) => x.label).join(', ')}]`);
        used.add(it.id);
        ids.push(it.id);
      }
      return { kind: 'select', ids };
    });
    return this;
  }
  number(match: string, value: number): this {
    this.script.push((d) => (d.kind === 'number' && d.prompt.includes(match) ? { kind: 'number', value } : null));
    return this;
  }
  yes(match: string, yes = true): this {
    this.script.push((d) => (d.kind === 'select' && d.prompt.includes(match) && d.items.some((i) => i.id === 'yes') ? { kind: 'select', ids: [yes ? 'yes' : 'no'] } : null));
    return this;
  }
  attack(list: [string | ObjId, TargetRef | PlayerId][]): this {
    this.script.push((d, tg) => {
      if (d.kind !== 'attackers') return null;
      return { kind: 'attackers', attacks: list.map(([a, t]) => [typeof a === 'number' ? a : tg.bf(a), typeof t === 'number' ? { kind: 'player', id: t } : t]) };
    });
    return this;
  }
  block(list: [string | ObjId, string | ObjId][]): this {
    this.script.push((d, tg) => {
      if (d.kind !== 'blockers') return null;
      const blocks: [ObjId, ObjId][] = list.map(([b, a]) => [typeof b === 'number' ? b : tg.bf(b, d.player), typeof a === 'number' ? a : tg.bf(a)]);
      return { kind: 'blockers', blocks: blocks.filter(([b]) => controllerOf(tg.g, b) === d.player) };
    });
    return this;
  }

  // ------------------------------------------------------------------ ações
  actionIds(): string[] {
    const d = this.pending;
    return d && d.kind === 'priority' ? d.actions.map((a) => a.id) : [];
  }
  private priorityAction(pred: (a: { id: string; label: string; obj?: ObjId }) => boolean, what: string): void {
    this.settle();
    const d = this.pending;
    if (!d || d.kind !== 'priority') throw new Error(`Sem prioridade para ${what}`);
    const a = d.actions.find(pred);
    if (!a) throw new Error(`Ação indisponível: ${what}. Disponíveis: ${d.actions.map((x) => x.label).join(' | ')}`);
    this.answer({ kind: 'priority', action: a.id });
    this.settle();
  }
  /** conjura uma carta pelo nome (da mão, por padrão) */
  cast(name: string, method = 'hand'): this {
    this.priorityAction((a) => a.id.startsWith('cast:') && a.id.endsWith(`:${method}`) && a.obj !== undefined && this.state.objects[a.obj] && (this.state.objects[a.obj].def === name || nameOf(this.g, a.obj) === name), `conjurar ${name}`);
    return this;
  }
  play(name: string): this {
    this.priorityAction((a) => a.id.startsWith('play:') && a.obj !== undefined && this.state.objects[a.obj]?.def === name, `jogar ${name}`);
    return this;
  }
  activate(name: string, textMatch?: string): this {
    this.priorityAction((a) => a.id.startsWith('act:') && a.obj !== undefined && nameOf(this.g, a.obj) === name && (!textMatch || a.label.includes(textMatch)), `ativar ${name}`);
    return this;
  }
  canCast(name: string): boolean {
    this.settle();
    return (this.pending?.kind === 'priority') && this.pending.actions.some((a) => a.id.startsWith('cast:') && a.obj !== undefined && this.state.objects[a.obj]?.def === name);
  }
  pass(): this {
    this.settle();
    this.answer({ kind: 'priority', action: 'pass' });
    this.settle();
    return this;
  }
  /** todos passam até o objeto do topo da pilha resolver (ou a etapa terminar) */
  resolve(): this {
    this.settle();
    const stack = this.state.zones.stack;
    const top = stack[stack.length - 1];
    const step = this.state.turn.step;
    const turn = this.state.turn.number;
    for (let i = 0; i < 20; i++) {
      this.pass();
      if (top === undefined || !this.state.zones.stack.includes(top) || this.state.turn.step !== step || this.state.turn.number !== turn || this.state.gameOver) return this;
    }
    throw new Error('A pilha não resolveu');
  }
  /** resolve a pilha toda */
  resolveAll(): this {
    for (let i = 0; i < 50 && this.state.zones.stack.length > 0; i++) this.resolve();
    return this;
  }
  /** passa até a condição valer numa decisão de prioridade */
  passUntil(pred: (tg: TestGame) => boolean, max = 400): this {
    for (let i = 0; i < max; i++) {
      this.settle();
      if (this.state.gameOver || (this.pending?.kind === 'priority' && pred(this))) return this;
      this.pass();
    }
    throw new Error('Condição não alcançada');
  }
  /** roda um gerador do motor fora de uma decisão (para montar situações de teste) */
  run<T>(gen: Generator<unknown, T, unknown>): T {
    let r = gen.next();
    while (!r.done) r = gen.next(undefined);
    this.refresh();
    return r.value;
  }
  /** depois de mexer no estado por fora, refaz a decisão de prioridade pendente (ações legais, gatilhos, SBAs) */
  refresh(): this {
    if (this.pending?.kind === 'priority') this.game = this.game.fork();
    return this;
  }
  /** passa até chegar na etapa pedida (do turno atual ou do próximo) */
  passTo(step: Step, turnOf?: PlayerId): this {
    for (let i = 0; i < 400; i++) {
      this.settle();
      if (this.state.gameOver) return this;
      if (this.state.turn.step === step && (turnOf === undefined || this.state.turn.active === turnOf) && this.pending?.kind === 'priority' && this.state.zones.stack.length === 0 && this.state.passesInRow === 0) return this;
      this.pass();
    }
    throw new Error(`Não chegou em ${step}`);
  }
}

/** monta a partida com as cartas pedidas, começando na etapa pedida com prioridade do ativo */
export function setup(o: SetupOptions = {}): TestGame {
  const n = o.players ?? 2;
  const config = {
    seed: o.seed ?? 'teste', players: Array.from({ length: n }, (_, i) => ({ name: NAMES[i], deckId: 'teste' })),
    startingLife: o.life ?? 40, turnLimit: null, multiplayer: o.multiplayer ?? n > 2,
  };
  const state = createGameState(config, Array.from({ length: n }, () => ({ id: 'x', nome: 'x', comandante: '__none__', cartas: [] })));
  // remove o comandante fictício
  for (const id of [...state.zones.command]) { delete state.objects[id]; }
  state.zones.command = [];
  state.cards = {};
  for (const p of state.players) p.commanders = [];
  state.turnOrder = Array.from({ length: n }, (_, i) => i);
  const active = o.active ?? 0;
  const turn = o.turn ?? 3;
  const STEPS: Step[] = ['untap', 'upkeep', 'draw', 'main1', 'beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat', 'main2', 'end', 'cleanup'];
  // fases já vistas neste turno, conforme a etapa em que o teste começa
  const ix = STEPS.indexOf(o.step ?? 'main1');
  const mainPhaseCount = ix >= STEPS.indexOf('main2') ? 2 : ix >= STEPS.indexOf('main1') ? 1 : 0;
  const combatCount = ix >= STEPS.indexOf('beginCombat') ? 1 : 0;
  state.turn = { number: turn, active, step: o.step ?? 'main1', queue: [], stepBegun: true, mainPhaseCount, combatCount, landsPlayed: 0 };
  state.turn.queue = STEPS.slice(STEPS.indexOf(state.turn.step) + 1);
  state.started = true;
  state.priority = active;
  if (['beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat'].includes(state.turn.step)) state.combat = newCombat();
  for (const p of state.players) { p.kept = true; p.lastTurn = p.id === active ? turn : turn - 1; }
  let nextCard = 1;
  const add = (p: PlayerId, spec: Spec, zone: ZoneName) => {
    const c: CardSpec = typeof spec === 'string' ? { name: spec } : spec;
    const cid = c.token ? null : nextCard++;
    if (cid !== null) state.cards[cid] = { id: cid, def: c.name, owner: p, isCommander: !!c.commander };
    if (c.commander && cid !== null) state.players[p].commanders.push(cid);
    const id = state.nextId++;
    const ready = c.ready ?? true;
    state.objects[id] = blankObject(id, {
      def: c.name, owner: p, controller: p, zone, card: cid, timestamp: state.nextTimestamp++, tapped: !!c.tapped,
      counters: { ...(c.counters ?? {}) }, damage: c.damage ?? 0, controlledSince: ready ? turn - 1 : turn, isToken: !!c.token,
    });
    if (zone === 'battlefield' && state.objects[id] && registryIsPlaneswalker(c.name) && c.counters?.loyalty === undefined) {
      state.objects[id].counters.loyalty = loyaltyOf(c.name);
    }
    if (zone === 'battlefield' || zone === 'stack' || zone === 'exile' || zone === 'command') state.zones[zone].push(id);
    else state.zones[zone][p].push(id);
    return { id, c };
  };
  const attachLater: { id: ObjId; to: string; p: PlayerId }[] = [];
  for (let p = 0; p < n; p++) {
    for (const s of o.battlefield?.[p] ?? []) { const r = add(p, s, 'battlefield'); if (r.c.attachTo) attachLater.push({ id: r.id, to: r.c.attachTo, p }); }
    for (const s of o.hand?.[p] ?? []) add(p, s, 'hand');
    for (const s of o.library?.[p] ?? []) add(p, s, 'library');
    for (const s of o.graveyard?.[p] ?? []) add(p, s, 'graveyard');
    for (const s of o.exile?.[p] ?? []) add(p, s, 'exile');
    for (const s of o.command?.[p] ?? []) add(p, typeof s === 'string' ? { name: s, commander: true } : { ...s, commander: true }, 'command');
  }
  for (const a of attachLater) {
    const target = Object.values(state.objects).find((x) => x.zone === 'battlefield' && x.def === a.to && x.id !== a.id);
    if (target) state.objects[a.id].attachedTo = target.id;
  }
  const game = Game.fromState(state);
  const tg = new TestGame(game);
  o.onStart?.(tg);
  tg.settle();
  return tg;
}

import { oracle } from '../motor/oracle.ts';
function registryIsPlaneswalker(name: string): boolean {
  try { return oracle(name).faces[0].types.includes('Planeswalker'); } catch { return false; }
}
function loyaltyOf(name: string): number {
  return oracle(name).faces[0].loyalty ?? 0;
}

export function item(d: Decision, label: string): ChoiceItem | undefined {
  return d.kind === 'select' ? d.items.find((i) => i.label === label) : undefined;
}

export const P = (id: PlayerId): TargetRef => ({ kind: 'player', id });
