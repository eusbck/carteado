// Peças repetidas nas cartas do deck Wakanda Forever (comandante, monarca, Vibranium, artefatos e luta).
import { controlledBy, controllerOf, createTokens, dealDamage, isType, manaValue, power } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** a permanente é um comandante de `p`? (ser comandante é da carta, CR 903.3) */
export function ehComandanteDe(g: G, id: ObjId, p: PlayerId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  return !!o && o.card !== null && o.owner === p && !!g.state.cards[o.card]?.isCommander;
}

/** "se você controla o seu comandante" (tenente e afins): basta um, se houver mais de um */
export function controlaComandante(g: G, p: PlayerId): boolean {
  return controlledBy(g, p, (id) => ehComandanteDe(g, id, p)).length > 0;
}

/** "crie N fichas de Vibranium viradas" */
export function* criaVibraniumVirado(c: Ctx, n = 1): Gen<ObjId[]> {
  return yield* createTokens(c.g, c.you, 'Vibranium', n, { tapped: true });
}

/** artefatos que o jogador controla */
export function artefatosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isType(g, id, 'Artifact'));
}

/** "uma mágica de artefato com valor de mana 4 ou maior" (predicado para on.youCast) */
export function artefatoDeValor4(c: { g: G }, id: ObjId): boolean {
  return isType(c.g, id, 'Artifact') && manaValue(c.g, id) >= 4;
}

/** CR 701.14a: lutar — cada criatura causa dano igual à própria força à outra, ao mesmo tempo; as duas precisam estar no campo */
export function luta(g: G, a: ObjId, b: ObjId): void {
  const s = g.state;
  if (s.objects[a]?.zone !== 'battlefield' || s.objects[b]?.zone !== 'battlefield') return;
  dealDamage(g, [
    { source: a, target: { kind: 'obj', id: b }, amount: power(g, a), combat: false },
    { source: b, target: { kind: 'obj', id: a }, amount: power(g, b), combat: false },
  ]);
}

/** o jogador que controla a permanente é o monarca? */
export function controladorEhMonarca(g: G, id: ObjId): boolean {
  return g.state.monarch !== null && controllerOf(g, id) === g.state.monarch;
}
