// Eventos do jogo (CR 700.1). Cada ação gera um lote de eventos simultâneos; os gatilhos
// são verificados sobre o lote (CR 603.2, 603.10).

import type { CardId, ManaType, ObjId, PlayerId, Step, TargetRef, ZoneName } from './types.ts';

export type GameEvent =
  | { type: 'zone'; obj: ObjId; old: ObjId; from: ZoneName | 'nowhere'; to: ZoneName; card: CardId | null; owner: PlayerId; controller: PlayerId; cause: string; token: boolean; by?: PlayerId; cast?: boolean }
  | { type: 'damage'; source: ObjId; controller: PlayerId; target: TargetRef; amount: number; combat: boolean }
  | { type: 'lifeGain'; player: PlayerId; amount: number; source: ObjId | null }
  | { type: 'lifeLoss'; player: PlayerId; amount: number; source: ObjId | null }
  | { type: 'counters'; target: TargetRef; kind: string; amount: number; by: PlayerId | null }
  | { type: 'countersRemoved'; target: TargetRef; kind: string; amount: number }
  | { type: 'tap'; obj: ObjId; forMana?: boolean }
  | { type: 'untap'; obj: ObjId }
  | { type: 'cast'; obj: ObjId; player: PlayerId; from: ZoneName; copy: boolean }
  | { type: 'copySpell'; obj: ObjId; player: PlayerId }
  | { type: 'activate'; obj: ObjId; source: ObjId; player: PlayerId; abilityId: string }
  | { type: 'attackers'; player: PlayerId; attackers: { obj: ObjId; target: TargetRef }[] }
  | { type: 'blockers'; blocks: [ObjId, ObjId][] }
  | { type: 'draw'; player: PlayerId; obj: ObjId; nth: number }
  | { type: 'discard'; player: PlayerId; obj: ObjId; card: CardId | null }
  | { type: 'sacrifice'; player: PlayerId; old: ObjId; obj: ObjId }
  | { type: 'token'; obj: ObjId; player: PlayerId }
  | { type: 'step'; step: Step; active: PlayerId; firstMain?: boolean }
  | { type: 'target'; target: TargetRef; by: ObjId; controller: PlayerId; spell: boolean }
  | { type: 'shuffle'; player: PlayerId }
  | { type: 'search'; player: PlayerId; library: PlayerId }
  | { type: 'scry'; player: PlayerId; n: number }
  | { type: 'surveil'; player: PlayerId; n: number }
  | { type: 'mill'; player: PlayerId; objs: ObjId[] }
  | { type: 'blight'; player: PlayerId; creature: ObjId; n: number }
  | { type: 'transform'; obj: ObjId; to: number }
  | { type: 'prepared'; obj: ObjId }
  | { type: 'phaseOut'; obj: ObjId }
  | { type: 'phaseIn'; obj: ObjId }
  | { type: 'resolved'; obj: ObjId; abilityId?: string; controller: PlayerId }
  | { type: 'mana'; player: PlayerId; source: ObjId; produced: ManaType[] }
  | { type: 'leave'; player: PlayerId }
  | { type: 'monarch'; player: PlayerId }
  | { type: 'levelUp'; obj: ObjId; level: number }
  | { type: 'attach'; obj: ObjId; to: ObjId }
  | { type: 'controlChange'; obj: ObjId; from: PlayerId; to: PlayerId };

export function isDies(ev: GameEvent): ev is Extract<GameEvent, { type: 'zone' }> {
  return ev.type === 'zone' && ev.from === 'battlefield' && ev.to === 'graveyard';
}

export function isEnter(ev: GameEvent): ev is Extract<GameEvent, { type: 'zone' }> {
  return ev.type === 'zone' && ev.to === 'battlefield';
}
