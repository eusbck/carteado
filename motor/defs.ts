// Linguagem de efeitos: tipos das definições de cartas e registro global.
// Uma carta é um arquivo TypeScript que chama defineCard() com habilidades montadas
// a partir destes tipos. As funções ficam aqui (código); o estado só guarda ids.

import type {
  Answer, Chars, Color, Decision, Duration, GameObject, ManaSymbol, ManaType, Mod, ObjId, PlayerId, Step,
  TargetRef, ZoneName,
} from './types.ts';
import type { G } from './game-context.ts';
import type { GameEvent } from './events.ts';

export type Gen<T = void> = Generator<Decision, T, Answer>;

// ---------------------------------------------------------------------------
// Contextos
// ---------------------------------------------------------------------------
/** contexto de uma habilidade ou mágica resolvendo, ou sendo posta na pilha */
export interface Ctx {
  g: G;
  /** controlador ("você", CR 109.5) */
  you: PlayerId;
  /** objeto na pilha (mágica ou habilidade); para estáticas, o próprio permanente */
  self: ObjId;
  /** fonte da habilidade (o permanente/carta); para mágicas, a própria mágica */
  source: ObjId;
  /** alvos já checados na resolução (null = ilegal agora) */
  targets: (TargetRef | null)[][];
  x: number;
  modes: number[];
  paid: Record<string, number | boolean>;
  /** dados do evento que disparou (gatilhos) */
  event: Record<string, unknown>;
  /** dados livres da habilidade na pilha (persistem entre etapas da resolução) */
  data: Record<string, unknown>;
  division?: number[][];
  method?: string;
  castFrom?: ZoneName;
  manaSpent?: { total: number; byType: Partial<Record<ManaType, number>>; colors: number };
}

/** contexto de estáticas, filtros e condições (sem pilha) */
export interface SCtx {
  g: G;
  you: PlayerId;
  source: ObjId;
  /** evento que disparou a habilidade (alvos de gatilhos que dependem dele) */
  event?: Record<string, unknown>;
}

export type EffectFn = (c: Ctx) => Gen<void>;

// ---------------------------------------------------------------------------
// Alvos (CR 115)
// ---------------------------------------------------------------------------
export interface TargetSpec {
  /** 'object' = permanente (padrão); 'player'; 'any' = criatura, planeswalker ou jogador (115.4);
   *  'spell' = mágica na pilha; 'card' = carta numa zona (cemitério…) */
  what: 'object' | 'player' | 'any' | 'spell' | 'card';
  zone?: ZoneName;
  filter?: (c: SCtx, t: TargetRef) => boolean;
  min?: number;
  max?: number | ((c: SCtx & { x?: number }) => number);
  label: string;
  /** o alvo deve ser diferente dos escolhidos para estes outros índices ("outro alvo") */
  differentFrom?: number[];
  /** escolhas extras com restrição entre os alvos escolhidos (soma de valores etc.) */
  validateSet?: (c: SCtx, chosen: TargetRef[]) => boolean;
}

export interface ModeSpec {
  min: number;
  max: number | ((c: SCtx) => number);
  modes: { text: string; targets?: TargetSpec[]; effect: EffectFn }[];
  /** cada modo escolhido precisa de alvo de jogador diferente (Shadrix) */
  differentPlayers?: boolean;
  /** quantidades de modos permitidas, quando não é um intervalo ("zero ou dois", Shadrix) */
  counts?: number[];
}

// ---------------------------------------------------------------------------
// Custos (CR 118, 601.2f-h, 602.2)
// ---------------------------------------------------------------------------
export type CostPart =
  | { k: 'mana'; cost: string }
  | { k: 'tap' }
  | { k: 'untap' }
  | { k: 'sacrificeSelf' }
  | { k: 'sacrifice'; n: number | 'X'; filter: (c: SCtx, o: ObjId) => boolean; label: string }
  | { k: 'discard'; n: number; filter?: (c: SCtx, o: ObjId) => boolean; label?: string; random?: boolean }
  | { k: 'discardSelf' }
  | { k: 'life'; n: number | 'X' | ((c: SCtx) => number) }
  | { k: 'exileSelf' }
  | { k: 'exileFromGraveyard'; n: number; other?: boolean; filter?: (c: SCtx, o: ObjId) => boolean }
  | { k: 'removeCounter'; kind: string; n: number; fromSelf?: boolean }
  | { k: 'removeCountersAmong'; n: number }
  | { k: 'addCounterSelf'; kind: string; n: number }
  | { k: 'blight'; n: number | 'X' }
  | { k: 'mill'; n: number }
  | { k: 'tapCreatures'; n: number; filter?: (c: SCtx, o: ObjId) => boolean }
  | { k: 'loyalty'; n: number | 'X' }
  | { k: 'returnLand' };

// ---------------------------------------------------------------------------
// Gatilhos (CR 603)
// ---------------------------------------------------------------------------
export interface TriggerCtx extends SCtx {
  /** objeto com a habilidade (pode ser LKI, se já saiu: CR 603.10) */
  obj: GameObject;
  chars: Chars;
}

export type TriggerSpec =
  /** devolver uma lista dispara uma vez para cada item (ex.: "para cada marcador colocado") */
  | { kind: 'event'; match: (ev: GameEvent, c: TriggerCtx) => boolean | Record<string, unknown> | Record<string, unknown>[] }
  /** "um ou mais": dispara uma vez por lote de eventos simultâneos (CR 603.2c) */
  | { kind: 'batch'; match: (evs: GameEvent[], c: TriggerCtx) => boolean | Record<string, unknown> | Record<string, unknown>[] }
  /** "no início da [etapa]" (CR 603.2b) */
  | { kind: 'step'; step: Step; whose: 'you' | 'each' | 'opponent'; firstMain?: boolean };

// ---------------------------------------------------------------------------
// Habilidades
// ---------------------------------------------------------------------------
interface AbilityCommon {
  id?: string;
  /** palavra-chave, para consultas como "tem voar" */
  kw?: string;
  param?: unknown;
  /** zonas onde a habilidade funciona (CR 113.6) */
  zones?: ZoneName[];
  text?: string;
}

export interface ManaAbilityDef extends AbilityCommon {
  kind: 'mana';
  cost: CostPart[];
  /** alternativas de mana produzida; o jogador escolhe uma (CR 605) */
  produce: (c: SCtx) => ManaType[][];
  condition?: (c: SCtx) => boolean;
  oncePerTurn?: boolean;
  restriction?: string;
  untilEndOfTurn?: boolean;
  onSpend?: string;
  /** efeito adicional (dano dos terrenos de dor etc.) */
  extra?: (c: Ctx) => Gen<void>;
}

export interface ActivatedDef extends AbilityCommon {
  kind: 'activated';
  cost: CostPart[];
  targets?: TargetSpec[];
  modes?: ModeSpec;
  effect: EffectFn;
  timing?: 'sorcery' | 'instant';
  condition?: (c: SCtx) => boolean;
  oncePerTurn?: boolean;
  activator?: 'controller' | 'opponents';
  /** X escolhido ao ativar (custos com {X}) */
  xMax?: (c: SCtx) => number;
}

export interface TriggeredDef extends AbilityCommon {
  kind: 'triggered';
  on: TriggerSpec;
  /** cláusula "se" interveniente (CR 603.4) */
  condition?: (c: SCtx & { event: Record<string, unknown> }) => boolean;
  targets?: TargetSpec[];
  modes?: ModeSpec;
  effect: EffectFn;
  /** "Esta habilidade só dispara uma vez a cada turno" */
  oncePerTurn?: boolean;
  /** habilidade de mana engatilhada (CR 605.1b) */
  mana?: boolean;
  /** capítulos de uma Saga que esta habilidade representa (CR 714.2) */
  chapters?: number[];
}

export interface RuleHooks {
  costModifier?: (c: SCtx, spell: SpellInfoForCost) => { reduce?: number; increase?: number; reduceColored?: Partial<Record<Color, number>> } | null;
  canAttack?: (c: SCtx, attacker: ObjId, target: TargetRef) => boolean;
  attackCost?: (c: SCtx, attacker: ObjId, target: TargetRef) => number;
  canBlock?: (c: SCtx, blocker: ObjId, attacker: ObjId) => boolean;
  assignsByToughness?: (c: SCtx, creature: ObjId) => boolean;
  canAttackWithDefender?: (c: SCtx, creature: ObjId, target: TargetRef) => boolean;
  noMaxHandSize?: (c: SCtx, player: PlayerId) => boolean;
  cantGainLife?: (c: SCtx, player: PlayerId) => boolean;
  damageCantBePrevented?: (c: SCtx) => boolean;
  damageAsWither?: (c: SCtx, source: ObjId) => boolean;
  untapDuringUntapOf?: (c: SCtx, obj: ObjId, activePlayer: PlayerId) => boolean;
  playerHexproof?: (c: SCtx, player: PlayerId) => boolean;
  cantBeCountered?: (c: SCtx, spell: ObjId) => boolean;
  cantCastSpells?: (c: SCtx, player: PlayerId) => boolean;
  loseHexproof?: (c: SCtx, obj: ObjId) => boolean;
  lifeGainBonus?: (c: SCtx, player: PlayerId) => number;
  extraTriggers?: (c: SCtx, trigger: { abilityId: string; source: ObjId; controller: PlayerId; event: Record<string, unknown>; cause: GameEvent | null }) => number;
  mayPlayFrom?: (c: SCtx, player: PlayerId, card: ObjId) => CastPermission | null;
  canBeBlockedBy?: (c: SCtx, attacker: ObjId, blocker: ObjId) => boolean;
  /** substituição de outros permanentes sobre como algo entra (CR 614.1d): altera o evento */
  enterModifier?: (c: SCtx, ev: EnterEvent, wouldBe: Chars) => void;
  /** criatura pode atacar este jogador? (restrições por jogador: Eriette, Promise of Loyalty) */
  canAttackPlayer?: (c: SCtx, attacker: ObjId, player: PlayerId) => boolean;
  /** permanentes deste jogador desviram durante a etapa de desvirar de outro (Seedborn Muse) */
  untapDuringOthers?: (c: SCtx, player: PlayerId) => boolean;
  /** goad contínuo ("a criatura encantada está goadada", CR 701.15): c.you goada a criatura */
  goads?: (c: SCtx, creature: ObjId) => boolean;
}

export interface SpellInfoForCost {
  obj: ObjId;
  controller: PlayerId;
  chars: Chars;
  targets: TargetRef[][];
  castFrom: ZoneName;
  method?: string;
}

export interface StaticDef extends AbilityCommon {
  kind: 'static';
  condition?: (c: SCtx) => boolean;
  /** objetos afetados (para efeitos de camada) */
  affects?: (c: SCtx, obj: GameObject) => boolean;
  /** modificações aplicadas a cada objeto afetado */
  mods?: (c: SCtx, obj: GameObject) => Mod[];
  /** habilidade que define característica (CR 604.3) */
  cda?: boolean;
  rules?: RuleHooks;
}

export interface EnterEvent {
  obj: ObjId;
  controller: PlayerId;
  tapped: boolean;
  counters: Record<string, number>;
  attachTo: ObjId | null;
  fromZone: ZoneName;
  /** escolhas feitas ao entrar */
  choices: Record<string, unknown>;
  copyOf: GameObject['copyOf'];
  faceDown?: boolean;
  /** valores da mágica que virou este permanente (CR 400.7d) */
  spell?: { x: number; paid: Record<string, number | boolean>; method?: string; manaSpent?: Ctx['manaSpent']; castFrom?: ZoneName };
  /** efeitos que começam junto com a entrada (Cursed Mirror: "ao entrar, vira uma cópia … até o fim do turno") */
  enterEffects?: { mods: Mod[]; duration: Duration; controller: PlayerId; sourceDef: string }[];
}

export interface ReplacementDef extends AbilityCommon {
  kind: 'replacement';
  /** "ao entrar" do próprio permanente (CR 614.1c-d, 614.12) */
  enters?: (c: SCtx, ev: EnterEvent) => Gen<void>;
  /** outros eventos: recebe o evento proposto, devolve o modificado (ou null para cancelar) */
  event?: 'lifeGain' | 'damage' | 'zoneChange' | 'counters' | 'enterOther';
  applies?: (c: SCtx, ev: Record<string, unknown>) => boolean;
  replace?: (c: SCtx, ev: Record<string, unknown>) => Record<string, unknown> | null;
}

export type AbilityDef = ManaAbilityDef | ActivatedDef | TriggeredDef | StaticDef | ReplacementDef;

// ---------------------------------------------------------------------------
// Conjuração (CR 601)
// ---------------------------------------------------------------------------
export interface AdditionalCostDef {
  key: string;
  label: string;
  optional: boolean;
  parts: CostPart[];
  /** alternativa: "blight 1 ou pague {3}" */
  orParts?: CostPart[];
  orLabel?: string;
  /** pode ser pago várias vezes (replicar, sacrificar X) */
  repeatable?: boolean;
}

export interface AltCastDef {
  key: string;
  label: string;
  /** zona de onde se conjura com este custo */
  zone: ZoneName;
  /** custo de mana alternativo ('' = sem custo de mana) */
  mana: string | null;
  parts?: CostPart[];
  /** depois de resolver ou sair da pilha vai para o exílio (flashback, CR 702.34a) */
  exileAfter?: boolean;
  condition?: (c: SCtx) => boolean;
  /** muda características da mágica (bestow vira Aura) */
  asAura?: boolean;
}

export interface CastPermission {
  /** id único da permissão (para "uma vez por turno") */
  key: string;
  label: string;
  /** sem pagar o custo de mana (CR 118.9) */
  free?: boolean;
  /** "mana de qualquer tipo pode ser gasta" (CR 118.14) */
  anyType?: boolean;
  /** custo alternativo de mana */
  mana?: string;
  parts?: CostPart[];
  /** efeito ao conjurar/jogar por esta permissão (Serra Paragon marca o objeto) */
  onUse?: (c: SCtx, newObj: ObjId) => void;
  /** permite jogar terreno */
  land?: boolean;
  /** só mágicas de criatura etc. */
  filter?: (c: SCtx, card: ObjId) => boolean;
  /** "Toda vez que essa mágica iria para o cemitério, coloque no fundo do grimório" (Quintorius) */
  bottomInstead?: boolean;
}

export interface SpellDef {
  targets?: TargetSpec[];
  modes?: ModeSpec;
  effect?: EffectFn;
  /** dividir N entre os alvos da especificação 0 (CR 601.2d) */
  divide?: (c: SCtx & { x: number }) => number;
  xMax?: (c: SCtx) => number;
}

export interface FaceDef {
  abilities?: AbilityDef[];
  spell?: SpellDef;
  /** Aura: o que pode encantar (CR 702.5, 303.4) */
  enchant?: TargetSpec;
  additionalCosts?: AdditionalCostDef[];
  altCosts?: AltCastDef[];
  /** redução/aumento do próprio custo ("custa {1} a menos para cada…") */
  selfCost?: (c: SCtx, info: { targets: TargetRef[][]; x: number }) => { reduce?: number; increase?: number; add?: string };
  cantBeCountered?: boolean;
  /** Delve (CR 702.66): cartas exiladas do cemitério pagam {1} cada */
  delve?: boolean;
  /** pode ser conjurada como se tivesse flash nesta situação */
  flash?: boolean;
}

export interface CardDef {
  name: string;
  faces: FaceDef[];
  /** cartas com comportamento ainda não implementado (modo manual) */
  pending?: boolean;
  /** rulings conferidos: índice do ruling -> teste ou motivo de não se aplicar */
  rulings?: Record<number, string>;
}

export interface TokenDef {
  id: string;
  name: string;
  types: string[];
  subtypes: string[];
  supertypes?: string[];
  colors: Color[];
  power: number | null;
  toughness: number | null;
  abilities: AbilityDef[];
  /** ficha de Aura: o que ela pode encantar (CR 303.4) */
  enchant?: TargetSpec;
  /** id Oracle da ficha em cartas/data, para a imagem */
  image?: string;
  /** ficha de duas faces (CR 111.10i, 712): o verso, que vale quando a ficha transforma (712.8e) */
  back?: Omit<TokenDef, 'id' | 'image' | 'back' | 'enchant'>;
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------
export const registry = {
  cards: new Map<string, CardDef>(),
  tokens: new Map<string, TokenDef>(),
  abilities: new Map<string, AbilityDef>(),
  /** funções nomeadas usadas por efeitos guardados no estado (restrições de mana etc.) */
  fns: new Map<string, (...args: never[]) => unknown>(),
};

function registerAbilities(owner: string, list: AbilityDef[] | undefined, prefix: string): void {
  list?.forEach((a, i) => {
    a.id = `${owner}${prefix}${i}`;
    registry.abilities.set(a.id, a);
  });
}

export function defineCard(def: CardDef): CardDef {
  def.faces.forEach((f, fi) => {
    registerAbilities(def.name, f.abilities, `#${fi}.`);
    f.spell?.modes?.modes.forEach(() => {});
  });
  registry.cards.set(def.name, def);
  return def;
}

export function defineToken(def: TokenDef): TokenDef {
  registerAbilities(`token:${def.id}`, def.abilities, '#');
  registerAbilities(`token:${def.id}`, def.back?.abilities, '#1.');
  registry.tokens.set(def.id, def);
  return def;
}

/** habilidade concedida ou atrasada que precisa de id estável */
export function defineAbility<T extends AbilityDef>(id: string, a: T): T {
  a.id = id;
  registry.abilities.set(id, a);
  return a;
}

export function defineFn<T extends (...args: never[]) => unknown>(id: string, fn: T): T {
  registry.fns.set(id, fn);
  return fn;
}

export function ability(id: string): AbilityDef {
  const a = registry.abilities.get(id);
  if (!a) throw new Error(`Habilidade não registrada: ${id}`);
  return a;
}

export function cardDef(name: string): CardDef | undefined {
  return registry.cards.get(name);
}

export type { ManaSymbol };
