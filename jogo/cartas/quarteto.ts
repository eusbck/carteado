// Padrões repetidos nas cartas do deck The Fantastic Four: "no início do combate no seu turno, se você conjurou uma
// mágica que não é de criatura neste turno, …" e "sempre que você conjura uma mágica que não é de criatura, …".
import { isCreature, on, triggered } from '../motor/api.ts';
import type { SCtx, TriggeredDef, TriggerSpec } from '../motor/defs.ts';

/** você conjurou uma mágica que não é de criatura neste turno? (cópias não contam: não são conjuradas) */
export function conjurouNaoCriatura(c: SCtx): boolean {
  return (c.g.state.turnStats[c.you]?.noncreatureSpellsCast ?? 0) > 0;
}

/** quantas mágicas que não são de criatura você conjurou neste turno */
export function naoCriaturasConjuradas(c: SCtx): number {
  return c.g.state.turnStats[c.you]?.noncreatureSpellsCast ?? 0;
}

/**
 * "No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, [efeito]."
 * A cláusula "se" é interveniente (CR 603.4): conferida ao disparar e de novo ao resolver.
 */
export function noCombateSeConjurou(effect: TriggeredDef['effect'], opts: { text: string; targets?: TriggeredDef['targets'] }): TriggeredDef {
  return triggered(on.beginCombat('you'), effect, { condition: conjurouNaoCriatura, targets: opts.targets, text: opts.text });
}

/** "Sempre que você conjura uma mágica que não é de criatura" (c.event.spell é a mágica) */
export function aoConjurarNaoCriatura(): TriggerSpec {
  return on.youCast((c, id) => !isCreature(c.g, id));
}

/** "Sempre que um jogador conjura uma mágica que não é de criatura" */
export function alguemConjuraNaoCriatura(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'cast' && !e.copy && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj) ? { spell: e.obj } : false));
}
