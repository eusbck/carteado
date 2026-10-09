// Tipos centrais do motor. Tudo o que está em GameState é JSON puro (serializável),
// para permitir snapshot, reprodução por semente e envio de vistas ao cliente.
// Funções (efeitos de cartas) ficam no registro de cartas e são referenciadas por id.

export type PlayerId = number;
export type ObjId = number;
export type CardId = number; // carta física (persiste entre zonas; CR 903.3 usa isso para o comandante)
export type Color = 'W' | 'U' | 'B' | 'R' | 'G';
export type ManaType = Color | 'C';
export type ZoneName = 'library' | 'hand' | 'graveyard' | 'battlefield' | 'stack' | 'exile' | 'command';

export const COLORS: Color[] = ['W', 'U', 'B', 'R', 'G'];

// ---------------------------------------------------------------------------
// Mana (CR 106, 107.4)
// ---------------------------------------------------------------------------
export type ManaSymbol =
  | { k: 'generic'; n: number }
  | { k: 'X' }
  | { k: 'C' }
  | { k: 'color'; c: Color }
  | { k: 'hybrid'; a: Color; b: Color }
  | { k: 'monohybrid'; c: Color; n: number } // {2/B}
  | { k: 'phyrexian'; c: Color }
  | { k: 'snow' };

export interface ManaUnit {
  type: ManaType;
  source: ObjId | null;
  /** id de restrição registrada (CR 106.6): só pode pagar o que a restrição aceitar */
  restriction?: string;
  /** não esvazia ao fim de etapas e fases até o fim do turno (Rousing Refrain) */
  untilEndOfTurn?: boolean;
  /** gatilho atrasado registrado ao gastar esta mana (Path of Ancestry, Study Hall) */
  onSpend?: { abilityId: string; source: ObjId; controller: PlayerId };
}

// ---------------------------------------------------------------------------
// Alvos e referências
// ---------------------------------------------------------------------------
export type TargetRef = { kind: 'obj'; id: ObjId } | { kind: 'player'; id: PlayerId };

// ---------------------------------------------------------------------------
// Objetos (CR 109)
// ---------------------------------------------------------------------------
export interface CopyValues {
  /** definição de carta/ficha de onde vêm as características copiáveis */
  def: string;
  face: number;
  /** exceções do efeito de cópia (CR 707.9b): sobrescrevem valores copiáveis */
  except?: CopyExcept;
}

export interface CopyExcept {
  name?: string;
  addTypes?: string[];
  addSubtypes?: string[];
  setTypes?: string[];
  removeOtherTypes?: boolean;
  addAbilities?: string[];
  addKeywords?: string[];
  power?: number;
  toughness?: number;
  colors?: Color[];
  legendary?: false;
}

export interface StackInfo {
  kind: 'spell' | 'activated' | 'triggered';
  controller: PlayerId;
  /** habilidade registrada (para habilidades na pilha) */
  abilityId?: string;
  /** objeto fonte; se já saiu da zona, usar state.lki[source] */
  source?: ObjId;
  modes: number[];
  targets: TargetRef[][];
  /** divisão de dano/marcadores entre alvos (CR 601.2d), mesma forma de targets */
  division?: number[][];
  x: number;
  /** custos opcionais anunciados (kicker, blight opcional, replicar N...) */
  paid: Record<string, number | boolean>;
  /** custo alternativo usado (flashback, escape, bestow, free, prepared...) */
  method?: string;
  castFrom?: ZoneName;
  manaSpent?: { total: number; byType: Partial<Record<ManaType, number>>; colors: number };
  /** dados do evento que disparou a habilidade */
  event?: Record<string, unknown>;
  data: Record<string, unknown>;
  isCopy: boolean;
}

export interface GameObject {
  id: ObjId;
  card: CardId | null;
  /** nome da definição: carta (Oracle) ou ficha registrada; '' para habilidades na pilha */
  def: string;
  owner: PlayerId;
  controller: PlayerId;
  zone: ZoneName;
  timestamp: number;
  /** face visível de uma carta de duas faces que transforma (0 = frente) */
  face: number;
  tapped: boolean;
  faceDown: boolean;
  phasedOut: boolean;
  counters: Record<string, number>;
  damage: number;
  /** recebeu dano de fonte com toque mortífero desde a última verificação (CR 704.5h) */
  deathtouched: boolean;
  attachedTo: ObjId | null;
  /** turno em que o controlador atual passou a controlar (CR 302.6) */
  controlledSince: number;
  isToken: boolean;
  /** valores copiáveis quando a ficha/cópia não usa a própria definição */
  copyOf: CopyValues | null;
  /** cópia de carta ou de mágica (CR 704.5e) */
  isCopy: boolean;
  /** escolhas feitas "ao entrar" (cor, tipo de criatura, X…) */
  choices: Record<string, unknown>;
  /** habilidades vinculadas: cartas exiladas com este objeto etc. (CR 607) */
  linked: Record<string, ObjId[]>;
  prepared: boolean;
  classLevel: number;
  /** designações: goaded (CR 701.15), vow etc. */
  goadedBy: { player: PlayerId; untilTurnOf: PlayerId; sinceTurn: number }[];
  /** quem pode ver uma carta virada para baixo ou numa zona oculta, além do dono */
  visibleTo: PlayerId[] | 'all' | null;
  /** habilidades "uma vez por turno" já usadas: chave -> turno */
  usedThisTurn: Record<string, number>;
  /** pilha */
  stack: StackInfo | null;
  /** dados livres que cartas guardam no objeto (ex.: Gift of Immortality) */
  data: Record<string, unknown>;
}

export interface CardInst {
  id: CardId;
  def: string;
  owner: PlayerId;
  isCommander: boolean;
}

// ---------------------------------------------------------------------------
// Efeitos contínuos (CR 611, 613)
// ---------------------------------------------------------------------------
export type Duration =
  | { kind: 'endOfTurn' }
  | { kind: 'endOfCombat' }
  | { kind: 'untilYourNextTurn'; player: PlayerId; sinceTurn: number }
  /** "até o fim do seu próximo turno": acaba na limpeza do próximo turno desse jogador */
  | { kind: 'endOfYourNextTurn'; player: PlayerId; afterTurn: number }
  | { kind: 'whileOnBattlefield'; obj: ObjId }
  | { kind: 'whileControlled'; obj: ObjId; player: PlayerId }
  | { kind: 'permanent' };

export type Layer = '1a' | '1b' | '2' | '3' | '4' | '5' | '6' | '7a' | '7b' | '7c' | '7d';

export type Mod =
  | { k: 'copy'; of: CopyValues }
  | { k: 'control'; player: PlayerId }
  | { k: 'addTypes'; types?: string[]; subtypes?: string[]; supertypes?: string[] }
  | { k: 'setTypes'; types: string[]; subtypes: string[]; keepSupertypes?: boolean }
  | { k: 'removeTypes'; types: string[] }
  | { k: 'setColors'; colors: Color[] }
  | { k: 'addKeyword'; kw: string; param?: unknown }
  | { k: 'addAbility'; id: string }
  | { k: 'loseAllAbilities' }
  | { k: 'loseKeyword'; kw: string }
  | { k: 'setPT'; p: number; t: number }
  /** só a resistência passa a ser N (camada 7b) */
  | { k: 'setT'; t: number }
  | { k: 'pt'; p: number; t: number }
  | { k: 'rule'; id: string; params?: Record<string, unknown> };

export interface ContinuousEffect {
  id: number;
  timestamp: number;
  source: ObjId;
  sourceDef: string;
  controller: PlayerId;
  duration: Duration;
  /** conjunto travado de objetos afetados (CR 611.2c); null = afeta regras/jogadores */
  affected: ObjId[] | null;
  affectedPlayers?: PlayerId[];
  mods: Mod[];
}

// ---------------------------------------------------------------------------
// Gatilhos (CR 603)
// ---------------------------------------------------------------------------
export interface PendingTrigger {
  abilityId: string;
  source: ObjId;
  controller: PlayerId;
  event: Record<string, unknown>;
  data: Record<string, unknown>;
  /** ordem de disparo, para desempate determinístico */
  seq: number;
}

export interface DelayedTrigger {
  id: number;
  abilityId: string;
  source: ObjId;
  controller: PlayerId;
  data: Record<string, unknown>;
  /** dispara só uma vez (CR 603.7b) a menos que tenha duração */
  once: boolean;
  /** turno em que expira (para "neste turno"), ou null */
  expiresTurn: number | null;
  createdTurn: number;
  createdStep: string;
}

// ---------------------------------------------------------------------------
// Turno (CR 500)
// ---------------------------------------------------------------------------
export type Step =
  | 'untap' | 'upkeep' | 'draw'
  | 'main1'
  | 'beginCombat' | 'declareAttackers' | 'declareBlockers' | 'firstStrikeDamage' | 'combatDamage' | 'endCombat'
  | 'main2'
  | 'end' | 'cleanup';

export interface TurnState {
  number: number;
  active: PlayerId;
  step: Step;
  /** etapas restantes do turno, depois da atual */
  queue: Step[];
  /** ações de turno da etapa atual já feitas */
  stepBegun: boolean;
  mainPhaseCount: number;
  combatCount: number;
  landsPlayed: number;
}

export interface CombatState {
  attackers: { id: ObjId; target: TargetRef; blocked: boolean; blockers: ObjId[]; removed: boolean }[];
  blockers: { id: ObjId; blocking: ObjId[] }[];
  /** criaturas que deram dano na etapa de primeiro golpe (CR 510.4) */
  firstStrikers: ObjId[];
  firstStrikeStep: boolean;
  declared: boolean;
}

// ---------------------------------------------------------------------------
// Jogadores
// ---------------------------------------------------------------------------
export interface PlayerState {
  id: PlayerId;
  name: string;
  deckId: string;
  life: number;
  counters: Record<string, number>;
  manaPool: ManaUnit[];
  left: boolean;
  lost: boolean;
  won: boolean;
  conceded: boolean;
  drewFromEmpty: boolean;
  commanders: CardId[];
  commanderCasts: Record<string, number>;
  /** dano de combate recebido de cada comandante (chave: CardId) — CR 903.10a */
  commanderDamage: Record<string, number>;
  mulligans: number;
  kept: boolean;
  citysBlessing: boolean;
  /** número do turno mais recente deste jogador (CR 302.6); -1 antes do primeiro */
  lastTurn: number;
}

/** estatísticas do turno atual por jogador, para cartas que olham "neste turno" */
export interface TurnStats {
  lifeGained: number;
  lifeLost: number;
  spellsCast: number;
  /** mágicas que não são de criatura conjuradas neste turno (pode faltar em partidas salvas antes de existir) */
  noncreatureSpellsCast?: number;
  instantSorceryCast: number;
  greatestInstantSorceryMV: number;
  cardsDrawn: number;
  cardsLeftGraveyard: number;
  attacked: boolean;
  attackedPlayers: PlayerId[];
  countersPutOnCreatures: number;
  creaturesDied: number;
  /** permanentes deste controlador que foram do campo para um cemitério (gravestorm conta todos) */
  permanentsToGraveyard: number;
  /** cartas que foram para o cemitério deste jogador neste turno vindas de fora do campo (Banon) */
  toGraveyardNotFromBattlefield: CardId[];
  sacrificedCreature: boolean;
}

export interface LogEntry {
  turn: number;
  text: string;
  /** null = todos veem; senão, só esses jogadores veem este texto */
  visibleTo: PlayerId[] | null;
  /** texto alternativo para quem não pode ver os detalhes */
  hiddenText?: string;
  rule?: string;
}

export interface GameConfig {
  seed: string;
  players: { name: string; deckId: string }[];
  startingLife: number;
  /** turnos completos antes de declarar empate (para partidas de bots) */
  turnLimit: number | null;
  /** partida de dois jogadores (CR 100.1a) ou multijogador (CR 100.1b) */
  multiplayer: boolean;
  /** permite ajustes manuais (para aplicar o efeito de cartas ainda sem definição); ficam no log */
  manualMode?: boolean;
  /**
   * regra de mulligan escolhida na sala: 'londres' (CR 103.5, o padrão) ou 'livre' (regra da casa:
   * troca a mão inteira por sete cartas novas, sem pôr nada no fundo, até MULLIGANS_LIVRES vezes)
   */
  mulligan?: 'londres' | 'livre';
  /**
   * desvirar à mão (ajuste manual) a própria permanente tira da reserva a mana que ela gerou e ainda está lá
   * (motor/manual.ts). As partidas criadas antes dessa regra não têm a chave e desviram sem mexer na reserva, como
   * quando foram jogadas: a reprodução delas pelas entradas gravadas não muda.
   */
  desvirarTiraMana?: boolean;
}

/** quantas vezes dá para trocar a mão no mulligan livre */
export const MULLIGANS_LIVRES = 3;

/** ajuste manual feito por um jogador com prioridade (modo manual) */
export type ManualAction =
  | { k: 'mover'; obj: ObjId; to: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'libraryTop' | 'libraryBottom' }
  | { k: 'vida'; player: PlayerId; delta: number }
  | { k: 'marcadores'; target: TargetRef; kind: string; delta: number }
  | { k: 'virar'; obj: ObjId; tapped: boolean }
  | { k: 'ficha'; def: string; n: number; player: PlayerId }
  | { k: 'comprar'; n: number }
  | { k: 'moer'; n: number }
  | { k: 'embaralhar' }
  | { k: 'buscar'; to: 'battlefield' | 'hand' | 'graveyard' | 'exile' | 'libraryTop' }
  | { k: 'videncia'; n: number }
  | { k: 'vigiar'; n: number };

export interface GameState {
  engineVersion: number;
  version: number;
  config: GameConfig;
  rng: [number, number, number, number];
  players: PlayerState[];
  turnOrder: PlayerId[];
  turn: TurnState;
  priority: PlayerId | null;
  passesInRow: number;
  objects: Record<number, GameObject>;
  cards: Record<number, CardInst>;
  zones: {
    library: ObjId[][];
    hand: ObjId[][];
    graveyard: ObjId[][];
    battlefield: ObjId[];
    stack: ObjId[];
    exile: ObjId[];
    command: ObjId[];
  };
  nextId: number;
  nextTimestamp: number;
  effects: ContinuousEffect[];
  pendingTriggers: PendingTrigger[];
  delayedTriggers: DelayedTrigger[];
  triggerSeq: number;
  combat: CombatState | null;
  turnStats: TurnStats[];
  /** estatísticas do último turno de cada jogador (Weathered Sentinels) */
  lastTurnAttackedPlayers: PlayerId[][];
  lki: Record<number, LkiEntry>;
  monarch: PlayerId | null;
  log: LogEntry[];
  gameOver: { winners: PlayerId[]; draw: boolean; reason: string } | null;
  decisionSeq: number;
  /** contadores livres por turno: habilidades que resolveram N vezes etc. */
  turnCounters: Record<string, number>;
  /** fase inicial: mulligan */
  started: boolean;
  /** objetos de comandante já oferecidos para voltar à zona de comando (CR 903.9a) */
  commanderOffered: ObjId[];
}

/** última informação conhecida de um objeto que mudou de zona (CR 608.2h) */
export interface LkiEntry {
  obj: GameObject;
  chars: Chars;
  turn: number;
  newId: ObjId | null;
  newZone: ZoneName | null;
}

// ---------------------------------------------------------------------------
// Características calculadas (CR 109.3, 613)
// ---------------------------------------------------------------------------
export interface AbilityInst {
  id: string;
  /** palavra-chave e parâmetro, quando a habilidade é de palavra-chave */
  kw?: string;
  param?: unknown;
  /** objeto que concedeu a habilidade (Aura, Equipamento…), se não for impressa */
  grantedBy?: ObjId;
}

export interface Chars {
  name: string;
  manaCost: ManaSymbol[] | null;
  manaValue: number;
  colors: Color[];
  supertypes: string[];
  types: string[];
  subtypes: string[];
  abilities: AbilityInst[];
  power: number | null;
  toughness: number | null;
  loyalty: number | null;
  /** controlador após a camada 2 */
  controller: PlayerId;
}

// ---------------------------------------------------------------------------
// Decisões e respostas
// ---------------------------------------------------------------------------
export interface ChoiceItem {
  id: string;
  label: string;
  obj?: ObjId;
  player?: PlayerId;
  /** carta mostrada só a quem decide (grimório, mão de outro…) */
  card?: { def: string; face?: number };
  disabled?: boolean;
}

export interface PriorityAction {
  id: string;
  kind: 'pass' | 'play' | 'cast' | 'activate' | 'mana' | 'special' | 'manual';
  label: string;
  obj?: ObjId;
}

export interface PaymentSource {
  id: string;
  obj: ObjId;
  label: string;
  /** cores/tipos que essa habilidade pode produzir */
  produces: ManaType[];
}

export type Decision = {
  id: number;
  player: PlayerId;
  prompt: string;
} & (
  | { kind: 'priority'; actions: PriorityAction[] }
  | { kind: 'select'; items: ChoiceItem[]; min: number; max: number; ordered?: boolean }
  | { kind: 'number'; min: number; max: number }
  | { kind: 'payment'; cost: string; remaining: string; sources: PaymentSource[]; canAuto: boolean; lifeOptions: number; canCancel: boolean }
  | { kind: 'attackers'; candidates: { obj: ObjId; targets: TargetRef[]; /** alvos que cumprem as exigências de ataque (CR 508.1d); ausente se não houver */ required?: TargetRef[]; /** mana genérica a pagar para atacar cada alvo, na ordem de targets (CR 508.1h); ausente se tudo for de graça */ costs?: number[] }[]; error?: string }
  | { kind: 'blockers'; candidates: { obj: ObjId; canBlock: ObjId[] }[]; attackers: ObjId[]; error?: string }
  | { kind: 'damage'; attacker: ObjId; amount: number; recipients: TargetRef[]; lethal: number[]; trample: boolean; error?: string }
  | { kind: 'arrange'; items: ChoiceItem[]; destinations: ('top' | 'bottom' | 'graveyard')[] }
  | { kind: 'mulligan'; handSize: number; mulligans: number }
);

export type Answer =
  | { kind: 'priority'; action: string; manual?: ManualAction }
  | { kind: 'select'; ids: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'payment'; auto?: boolean; activate?: { source: string; type?: ManaType }; pay?: boolean; life?: number; cancel?: boolean }
  | { kind: 'attackers'; attacks: [ObjId, TargetRef][] }
  | { kind: 'blockers'; blocks: [ObjId, ObjId][] }
  | { kind: 'damage'; assign: number[] }
  | { kind: 'arrange'; placement: Record<string, 'top' | 'bottom' | 'graveyard'>; order: string[] }
  | { kind: 'mulligan'; keep: boolean };
