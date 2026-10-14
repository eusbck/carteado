// Linguagem de efeitos: tipos das definições de cartas e registro global.
// Uma carta é um arquivo TypeScript que chama defineCard() com habilidades montadas
// a partir destes tipos. As funções ficam aqui (código); o estado só guarda ids.

import type {
  Answer, Chars, Color, CopyValues, Decision, Duration, GameObject, ManaSymbol, ManaType, ManaUnit, Mod, ObjId, PlayerId, Step,
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
  manaSpent?: { total: number; byType: Partial<Record<ManaType, number>>; colors: number; fromArtifacts?: number };
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
   *  'spell' = mágica na pilha; 'card' = carta numa zona (cemitério…); 'spellOrPermanent' = mágica na pilha ou
   *  permanente ("mágica ou criatura alvo"; o filtro separa os dois) */
  what: 'object' | 'player' | 'any' | 'spell' | 'card' | 'spellOrPermanent' | 'ability';
  zone?: ZoneName;
  filter?: (c: SCtx, t: TargetRef) => boolean;
  min?: number;
  max?: number | ((c: SCtx & { x?: number }) => number);
  label: string;
  /** o alvo deve ser diferente dos escolhidos para estes outros índices ("outro alvo") */
  differentFrom?: number[];
  /** escolhas extras com restrição entre os alvos escolhidos (soma de valores etc.) */
  validateSet?: (c: SCtx, chosen: TargetRef[]) => boolean;
  /** alvo da parte que só vale se o presente foi prometido: sem presente, não se escolhe (CR 702.174m) */
  gift?: boolean;
}

export interface ModeSpec {
  min: number;
  max: number | ((c: SCtx) => number);
  modes: { text: string; targets?: TargetSpec[]; effect: EffectFn }[];
  /** cada modo escolhido precisa de alvo de jogador diferente (Shadrix) */
  differentPlayers?: boolean;
  /** quantidades de modos permitidas, quando não é um intervalo ("zero ou dois", Shadrix) */
  counts?: number[];
  /** "você pode escolher o mesmo modo mais de uma vez" (CR 700.2d): escolhe exatamente `max` modos, com repetição */
  repeat?: boolean;
  /** o modo pode ser escolhido agora? ("escolha um que não foi escolhido neste turno", Parapet Thrasher; CR 700.2) */
  available?: (c: SCtx, mode: number) => boolean;
  /** chamado quando os modos são escolhidos, antes de a mágica ou habilidade ir para a pilha */
  onChosen?: (c: SCtx, modes: number[]) => void;
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
  /** "exile N cartas [com o filtro] da sua mão" (Force of Will): as exiladas ficam em costInfo.exiledFromHand */
  | { k: 'exileFromHand'; n: number; filter?: (c: SCtx, o: ObjId) => boolean; label?: string }
  | { k: 'life'; n: number | 'X' | ((c: SCtx) => number) }
  | { k: 'exileSelf' }
  | { k: 'exileFromGraveyard'; n: number; other?: boolean; filter?: (c: SCtx, o: ObjId) => boolean }
  | { k: 'removeCounter'; kind: string; n: number; fromSelf?: boolean }
  | { k: 'removeCountersAmong'; n: number }
  | { k: 'addCounterSelf'; kind: string; n: number }
  | { k: 'blight'; n: number | 'X' }
  | { k: 'mill'; n: number }
  | { k: 'tapCreatures'; n: number; filter?: (c: SCtx, o: ObjId) => boolean; label?: string; includeSelf?: boolean }
  | { k: 'tapPermanents'; n: number | 'X'; filter: (c: SCtx, o: ObjId) => boolean; label: string }
  /** "Desvire N criaturas viradas que você controla" (Halo Fountain) */
  | { k: 'untapCreatures'; n: number }
  | { k: 'crew'; power: number }
  | { k: 'returnPermanent'; filter: (c: SCtx, o: ObjId) => boolean; label: string }
  | { k: 'loyalty'; n: number | 'X' }
  | { k: 'returnLand' }
  /** devolver à mão um atacante não bloqueado que você controla (ninjutsu, CR 702.49a; sneak, 702.190a): o pago fica em
   *  costInfo.returnedAttacker = { obj, target } (quem ele atacava, para a carta entrar atacando o mesmo) */
  | { k: 'returnUnblockedAttacker'; label?: string }
  /** revelar esta carta da mão ou da zona de comando (ninjutsu, CR 702.49a-b) */
  | { k: 'revealSelf' }
  /** custo próprio da carta (CR 118.1, 602.2b): `canPay` diz se dá para pagar agora e `pay` paga, devolvendo o que entra em
   *  costInfo ou false se não pagou (Void Attendant: "ponha no cemitério do dono uma carta exilada de um oponente") */
  | { k: 'custom'; label: string; canPay: (c: SCtx) => boolean; pay: (c: SCtx) => Gen<Record<string, unknown> | false> };

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
  | { kind: 'step'; step: Step; whose: 'you' | 'each' | 'opponent'; firstMain?: boolean }
  /** gatilho de estado, sem repetir enquanto estiver pendente ou na pilha (CR 603.8) */
  | { kind: 'state'; check: (c: TriggerCtx) => boolean };

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
  /** id de função (defineFn) chamada quando a mana é gasta, sem usar a pilha: (g, unidade, propósito, jogador) */
  rider?: string;
  /** efeito adicional (dano dos terrenos de dor etc.) */
  extra?: (c: Ctx) => Gen<void>;
  /** precons-a: o X do custo é a quantidade de mana da alternativa escolhida ("vire X fichas: adicione X manas",
   *  Hazel of the Rootbloom); sem isto, X = 0 nas habilidades de mana */
  xFromAlt?: boolean;
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
  /** redução do próprio custo de ativação, fixada antes do pagamento (CR 602.2b, 601.2f) */
  selfCost?: (c: SCtx, x: number) => { reduce?: number; increase?: number };
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
  /** quem escolhe os alvos ao pôr a habilidade na pilha, se não for o controlador ("à escolha desse jogador": Bladegriff
   *  Prototype; CR 603.3d, 601.2c). A legalidade dos alvos continua sendo a do controlador. */
  targetChooser?: (c: SCtx & { event: Record<string, unknown> }) => PlayerId;
}

export interface RuleHooks {
  attacksIfAble?: (c: SCtx, creature: ObjId) => boolean;
  /** "ataca [um destes jogadores] a cada combate se puder" (Galactus): a exigência só é cumprida atacando um deles; null = sem exigência */
  attacksOneOfIfAble?: (c: SCtx, creature: ObjId) => PlayerId[] | null;
  cantUntapDuringUntapOf?: (c: SCtx, obj: ObjId, activePlayer: PlayerId) => boolean;
  castAsThoughFlash?: (c: SCtx, player: PlayerId, card: ObjId) => boolean;
  /** previsão das habilidades de mana engatilhadas, usadas pelo planejador; o efeito real resolve por CR 605.4 */
  extraManaForPlanning?: (c: SCtx, player: PlayerId, source: ObjId, produced: ManaType[], tappedForMana: boolean) => ManaType[];
  costModifier?: (c: SCtx, spell: SpellInfoForCost) => { reduce?: number; increase?: number; reduceColored?: Partial<Record<Color, number>> } | null;
  canAttack?: (c: SCtx, attacker: ObjId, target: TargetRef) => boolean;
  attackCost?: (c: SCtx, attacker: ObjId, target: TargetRef) => number;
  /** custo genérico para [bloqueador] bloquear [atacante] (Archangel of Tithes; CR 509.1d) */
  blockCost?: (c: SCtx, blocker: ObjId, attacker: ObjId) => number;
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
  /** proibição que depende da mágica (Void Winnower: "não podem conjurar mágicas com valor de mana par"); o valor de mana já inclui o X escolhido */
  cantCastSpell?: (c: SCtx, player: PlayerId, spell: ObjId, manaValue: number) => boolean;
  loseHexproof?: (c: SCtx, obj: ObjId) => boolean;
  lifeGainBonus?: (c: SCtx, player: PlayerId) => number;
  /** "se você fosse ganhar vida, em vez disso ganha o dobro" (Boon Reflection); aplicado depois de lifeGainBonus */
  lifeGainDouble?: (c: SCtx, player: PlayerId) => boolean;
  /** `batch`: o lote de eventos simultâneos em que o gatilho disparou (Felix Five-Boots olha o dano de combate dos gatilhos de "um ou mais") */
  extraTriggers?: (c: SCtx, trigger: { abilityId: string; source: ObjId; controller: PlayerId; event: Record<string, unknown>; cause: GameEvent | null; batch?: GameEvent[] }) => number;
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
  /**
   * substituição de um permanente que sairia do campo (CR 614.1a, 614.6: "morreria" = iria do campo para o cemitério):
   * devolve o novo destino e, se for o caso, o que acontece junto ("exile em vez disso e crie uma ficha", Kalitas)
   */
  leavesBattlefield?: (c: SCtx, obj: GameObject, dest: ZoneName) => { dest: ZoneName; then?: () => Gen<void>; label?: string } | null;
  /** "Você não pode perder o jogo" (CR 104.3, 704.5a-c, 704.6c): as ações de estado não fazem o jogador perder */
  cantLoseGame?: (c: SCtx, player: PlayerId) => boolean;
  /** "[esse jogador] não pode vencer o jogo" (Herald of Eternal Dawn): um efeito que diria que ele vence não faz nada (CR 104.2b) */
  cantWinGame?: (c: SCtx, player: PlayerId) => boolean;
  /** "[permanentes] não podem receber marcadores [tipo]" (CR 122): vale também para os que entram com marcadores */
  cantHaveCountersPut?: (c: SCtx, kind: string, target: { controller: PlayerId; chars: Chars }) => boolean;
  /** proteção de um jogador (CR 702.16b, 702.16e): qualidades no formato de protectionMatches ('type:Creature'…) */
  playerProtection?: (c: SCtx, player: PlayerId) => unknown[];
  /** "Se você fosse perder mana não gasta, ela se torna incolor" (Omnath, Locus of the Void; CR 106.4, 500.5) */
  unspentManaBecomesColorless?: (c: SCtx, player: PlayerId) => boolean;
  /**
   * substituição na criação de fichas de um jogador (CR 111.1, 614.1a): "cria o dobro dessas fichas" (Anointed
   * Procession), "pode criar essa quantidade de fichas X em vez disso" (Jinnie Fay). null = não se aplica; `replace`
   * devolve as fichas que serão criadas (e pode perguntar). Com várias, o jogador escolhe a ordem (616.1, 616.1f)
   */
  tokenCreation?: (c: SCtx, ev: TokenCreation) => { label: string; replace: (ev: TokenCreation) => Gen<TokenCreation> } | null;
  /** "Previna todo o dano que seria causado a [isto]" (CR 615.1a): true previne o dano inteiro deste pedido */
  preventsDamage?: (c: SCtx, target: TargetRef, source: ObjId, combat: boolean) => boolean;
  /**
   * "Previna N desse dano" (Heart-Shaped Herb) ou "previna esse dano e [faça algo com a quantidade]" (Panther Habit):
   * devolve quanto do dano é prevenido. Só é chamado quando o dano vai mesmo ser causado, então o gancho pode fazer o
   * que a carta manda fazer com a quantidade prevenida (CR 615.1, 615.5).
   */
  preventsSomeDamage?: (c: SCtx, target: TargetRef, source: ObjId, amount: number, combat: boolean) => number;
  /** "se [esse jogador] fosse perder vida, em vez disso perde o dobro" (Bloodletter of Aclazotz) */
  lifeLossDouble?: (c: SCtx, player: PlayerId) => boolean;
  /** "…causa esse dano mais N" (Thor, Asgard's Avenger): devolve N para este pedido de dano */
  damageBonus?: (c: SCtx, source: ObjId, target: TargetRef, combat: boolean) => number;
  /** "dobre todo o dano que [essas fontes] causariam" (Raphael, the Muscle): true dobra o dano deste pedido */
  damageDouble?: (c: SCtx, source: ObjId, target: TargetRef, combat: boolean) => boolean;
  /** "…em vez disso são postos esses marcadores mais N" (High Score): devolve N para este tipo de marcador nesta permanente */
  countersBonus?: (c: SCtx, kind: string, perm: { controller: PlayerId; chars: Chars }) => number;
  /** "…em vez disso é posto o dobro desses marcadores" (Corpsejack Menace) */
  countersDouble?: (c: SCtx, kind: string, perm: { controller: PlayerId; chars: Chars }) => boolean;
  /** mágicas que um jogador conjura têm convocar (CR 702.51; Dazzling Theater: "mágicas de criatura que você conjura") */
  spellsHaveConvoke?: (c: SCtx, player: PlayerId, spell: ObjId, chars: Chars) => boolean;
  /** cópias adicionais quando este jogador copia uma mágica (Twinning Staff): devolve quantas a mais */
  extraSpellCopies?: (c: SCtx, player: PlayerId) => number;
  /** custos adicionais que este permanente concede às mágicas de um jogador (Anhelo: "tem baixa 2"; CR 601.2b) */
  grantedAdditionalCosts?: (c: SCtx, player: PlayerId, spell: ObjId) => AdditionalCostDef[] | null;
  // lote2-d
  /** "A regra da lenda não se aplica aos permanentes que você controla" (Sakashima; CR 704.5j) */
  legendRuleExempt?: (c: SCtx, player: PlayerId) => boolean;
  /** "não pode ser bloqueada exceto por N ou mais criaturas" (Troll of Khazad-dûm): devolve N; 0 = sem restrição */
  minBlockers?: (c: SCtx, attacker: ObjId) => number;
  /** "não pode ser bloqueada por mais de N criaturas" (Challenger Troll; restrição de bloqueio, CR 509.1b): devolve N; null = sem restrição */
  maxBlockers?: (c: SCtx, attacker: ObjId) => number | null;
  /** "você pode jogar um terreno adicional em cada um dos seus turnos" (Loot, Exuberant Explorer; CR 305.2): quantos a mais */
  extraLandPlays?: (c: SCtx, player: PlayerId) => number;
  /** "[esta criatura] tripula Veículos como se a força dela fosse N maior" (ficha Pilot; CR 702.122a): N a mais para esta criatura */
  crewPowerBonus?: (c: SCtx, creature: ObjId) => number;
  /** "esta criatura precisa ser bloqueada por exatamente uma criatura se puder" (Nacatl War-Pride) */
  mustBeBlockedByExactlyOne?: (c: SCtx, attacker: ObjId) => boolean;
  /**
   * "se [esse jogador] fosse comprar uma carta que não a primeira da etapa de compra dele, em vez disso ele pula essa
   * compra e você compra uma carta" (Notion Thief). O motor só consulta fora da primeira compra da etapa de compra.
   */
  drawInstead?: (c: SCtx, player: PlayerId) => boolean;
  /**
   * "se um jogador fosse comprar uma carta, em vez disso ele [faz outra coisa]" (Shared Fate; CR 614.1a): o gerador faz
   * o que entra no lugar da compra. Com mais de um, quem compraria escolhe qual se aplica (CR 616.1); a compra é
   * substituída uma vez só.
   */
  drawReplace?: (c: SCtx, player: PlayerId) => Gen<void>;
  /** condição da substituição de compra da mesma permanente; sem este gancho, ela vale sempre */
  drawReplaceApplies?: (c: SCtx, player: PlayerId) => boolean;
  /** "habilidades ativadas de [essas fontes] custam {N} a menos", sem baixar a mana do custo a menos de minMana (Convergence of Dominion) */
  abilityCostModifier?: (c: SCtx, player: PlayerId, source: ObjId, def: ActivatedDef) => { reduce: number; minMana?: number } | null;
  /**
   * Ação baseada em estado definida pela carta (CR 704), conferida junto com as do jogo e podendo pedir escolhas
   * (Space Beleren: quem controla uma criatura sem setor a põe num setor). Devolve true se fez alguma coisa; precisa
   * devolver false quando não há mais nada a fazer, ou a conferência não termina.
   */
  stateAction?: (c: SCtx) => Gen<boolean>;
  /** "se [esse jogador] fosse comprar duas ou mais cartas, em vez disso você e ele compram uma carta cada" (Alms Collector) */
  multiDrawInstead?: (c: SCtx, player: PlayerId, n: number) => boolean;
  /** "Seus oponentes não podem procurar em grimórios" (Stranglehold; CR 701.23) */
  cantSearchLibraries?: (c: SCtx, player: PlayerId) => boolean;
  /** "Você pode olhar a carta do topo do seu grimório a qualquer momento" (Vesuvan Drifter, Realmwalker) */
  lookAtTopOfLibrary?: (c: SCtx, player: PlayerId) => boolean;
  /** "Você não perde mana [vermelha] não gasta quando as etapas e fases terminam" (Leyline Tyrant; CR 106.4, 500.5) */
  keepsUnspentMana?: (c: SCtx, player: PlayerId, unit: ManaUnit) => boolean;
}

/** fichas que um evento vai criar para um jogador (CR 111.1). `de` aponta o pedido de onde a ficha veio: o resto do
 *  que o efeito diz (virada, atacando, marcadores) continua valendo para ela (ruling de Jinnie Fay) */
export interface TokenCreation { player: PlayerId; tokens: { de: number; def?: string; copyOf?: CopyValues }[] }

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
  /**
   * a estática do campo também vale para objetos fora dele (mágicas na pilha e cartas nas outras zonas) que passem em
   * `affects` — "o mesmo vale para as mágicas de criatura que você controla e as cartas de criatura de que você é dono"
   * (Maskwood Nexus). Fora do campo `affects` não pode ler características calculadas do próprio objeto.
   */
  offField?: boolean;
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
  spell?: { x: number; paid: Record<string, number | boolean>; method?: string; manaSpent?: Ctx['manaSpent']; castFrom?: ZoneName; giftTo?: PlayerId };
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
  /** repetível só de mana: o máximo oferecido é o que a mana disponível paga (multikicker, esquadrão) */
  capByMana?: boolean;
  /** pago uma vez para cada modo escolhido além do primeiro, sem perguntar (escalada, CR 702.120a) */
  perExtraMode?: boolean;
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
  /** conjurada virada para baixo como criatura 2/2 sem nome, texto, subtipos nem custo (morph, CR 702.37c, 708.4) */
  faceDown?: boolean;
  /** "alvo" vira "cada" (sobrecarga, CR 702.96a-b): a mágica não tem alvos; o efeito olha c.method */
  noTargets?: boolean;
  /** paga o custo de mana normal (retraçar, CR 702.81a: só muda a zona e acrescenta custo) */
  useManaCost?: boolean;
  /** quando pode ser conjurada, no lugar da regra de instantânea/feitiço (sneak: na sua etapa de declarar bloqueadores) */
  timing?: (c: SCtx) => boolean;
  /** também da zona de comando, se for o seu comandante (o custo alternativo vale na pilha: sneak) */
  fromCommandZone?: boolean;
  /** a permanente entra virada e atacando quem o atacante devolvido no custo atacava (sneak, CR 702.190b) */
  enterAttacking?: boolean;
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
  /** "Se uma mágica conjurada assim fosse para o seu cemitério, exile-a em vez disso" (Kess, Dissident Mage) */
  exileInstead?: boolean;
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
  /** Convoke (CR 702.51): cada criatura virada ao conjurar paga {1} ou uma mana da cor dela */
  convoke?: boolean;
  /** Improvisar (CR 702.126): artefatos virados pagam somente mana genérica, depois de ativar habilidades de mana */
  improvise?: boolean;
  /** Gift (CR 702.174): ao conjurar, pode prometer o presente a um oponente; em instantânea e feitiço ele o recebe
   *  antes dos outros efeitos (702.174j). `give` dá o presente ao jogador escolhido. */
  gift?: { label: string; give: (c: Ctx, to: PlayerId) => Gen<void> };
  /** pode ser conjurada como se tivesse flash nesta situação */
  flash?: boolean;
  /** "Conjure esta mágica somente [quando…]" (Master Warcraft: antes de os atacantes serem declarados; CR 601.3) */
  castOnlyIf?: (c: SCtx) => boolean;
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

/** emblema (CR 114): só tem as habilidades, que funcionam na zona de comando (114.3, 114.4) */
export interface EmblemDef {
  id: string;
  /** nome para a mesa e o registro (a maioria dos emblemas não tem nome, CR 114.3) */
  name: string;
  abilities: AbilityDef[];
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
  emblems: new Map<string, EmblemDef>(),
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

/** emblema (CR 114.4): as habilidades funcionam na zona de comando */
export function defineEmblem(def: EmblemDef): EmblemDef {
  for (const a of def.abilities) a.zones = ['command'];
  registerAbilities(`emblem:${def.id}`, def.abilities, '#');
  registry.emblems.set(def.id, def);
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
