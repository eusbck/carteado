// Passagem automática de prioridade (CR 732, atalhos). O jogador configura em que etapas
// quer parar no próprio turno e no dos outros; fora delas o sistema passa por ele.
// O servidor aplica o mesmo atraso a todo passe automático, para não revelar se a pessoa
// tinha ou não alguma resposta.

import type { Decision, GameState, PlayerId, Step } from './types.ts';

export interface StopSettings {
  /** etapas em que paro no meu turno, com a pilha vazia */
  myTurn: Step[];
  /** etapas em que paro no turno dos outros, com a pilha vazia */
  othersTurn: Step[];
  /** parar quando um oponente põe algo na pilha */
  stopOnOpponentStack: boolean;
  /** parar quando algo meu está na pilha (para responder a mim mesmo) */
  stopOnOwnStack: boolean;
  /** "passar até o fim do turno": vale até o fim do turno com este número */
  passUntilTurnEnds: number | null;
}

export const DEFAULT_STOPS: StopSettings = {
  myTurn: ['main1', 'beginCombat', 'main2'],
  othersTurn: ['end'],
  stopOnOpponentStack: true,
  stopOnOwnStack: false,
  passUntilTurnEnds: null,
};

/**
 * Deve passar automaticamente? Só decisões de prioridade são automatizadas; qualquer outra
 * decisão (alvos, bloqueios, pagamento) sempre espera o jogador.
 */
export function shouldAutoPass(s: GameState, d: Decision, player: PlayerId, st: StopSettings): boolean {
  if (d.kind !== 'priority' || d.player !== player) return false;
  // sem nada além de passar (e ativar mana à toa), não há o que decidir
  const meaningful = d.actions.filter((a) => a.kind !== 'pass' && a.kind !== 'mana' && a.kind !== 'manual');
  if (meaningful.length === 0) return true;
  if (st.passUntilTurnEnds !== null && st.passUntilTurnEnds === s.turn.number) {
    if (!st.stopOnOpponentStack) return true;
    const top = s.zones.stack[s.zones.stack.length - 1];
    if (top === undefined) return true;
    return s.objects[top]?.stack?.controller === player;
  }
  const top = s.zones.stack[s.zones.stack.length - 1];
  if (top !== undefined) {
    const ctrl = s.objects[top]?.stack?.controller;
    if (ctrl === player) return !st.stopOnOwnStack;
    return !st.stopOnOpponentStack;
  }
  const mine = s.turn.active === player;
  const stops = mine ? st.myTurn : st.othersTurn;
  return !stops.includes(s.turn.step);
}
