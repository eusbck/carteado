// Ponto único de importação para as definições de cartas.

export * from './dsl.ts';
export * from './efeitos.ts';
export {
  addCounters, removeCounters, addMana, allCreatures, attach, becomeMonarch, blight, controlledBy, createTokens, creaturesOf,
  dealDamage, destroy, discard, draw, exile, gainControl, gainLife, goad, lookAndArrange, loseLife, mill, moveObject,
  moveObjects, permanentsMatching, putOntoBattlefield, returnToHand, sacrifice, searchLibrary, shuffleLibrary, tap, untap,
  enchantCandidates,
} from './actions.ts';
export {
  chars, controllerOf, hasKw, hooks, isCreature, isLand, isLegendary, isPermanentCard, isSubtype, isType, kwParams, manaValue,
  nameOf, power, toughness, printedChars,
} from './chars.ts';
export { ask, chooseColor, chooseItems, chooseNumber, chooseOne, objItem, playerItem, yesNo, COLOR_NAMES } from './ask.ts';
export { counter, castSpell, candidateTargets, isLegalTarget, copySpell } from './stack.ts';
export { addEffect, createObject, destroyObject, newTimestamp, objOrLki } from './state.ts';
export { emit, addPending } from './triggers.ts';
export { payMana, payParts } from './costs.ts';
export { parseCost, formatCost, manaValueOf } from './mana.ts';
export type { G } from './game-context.ts';
export type { Chars, Color, GameObject, ManaType, Mod, ObjId, PlayerId, TargetRef, ZoneName } from './types.ts';
export * from './mecanicas.ts';
export { addCombatPhaseAfterCurrent } from './turn.ts';
