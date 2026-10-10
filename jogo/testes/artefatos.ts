// Situações de cartas de artefato: biblioteca suficiente para atravessar turnos sem perdas acidentais por compra.
import { createObject, putOntoBattlefield, moveObjects, nameOf } from '../motor/api.ts';
import { validateShape, type LiveDecision } from '../motor/ask.ts';
import type { Gen } from '../motor/defs.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';
import { setup, type SetupOptions, type TestGame } from './harness.ts';

export function fixture(o: SetupOptions = {}): TestGame {
  return setup({ ...o, library: o.library ?? Array.from({ length: o.players ?? 2 }, () => Array(40).fill('Forest')) });
}

export function activateMana(tg: TestGame, name: string, type: string): void {
  tg.settle();
  const d = tg.pending;
  if (d?.kind !== 'priority') throw new Error('Sem prioridade para produzir mana');
  const action = d.actions.find((a) => a.kind === 'mana' && a.obj !== undefined && nameOf(tg.g, a.obj) === name && a.label.includes(`{${type}}`));
  if (!action) throw new Error(`Habilidade de mana indisponível: ${name}, ${type}`);
  tg.answer({ kind: 'priority', action: action.id });
  tg.settle();
}

export function runEffect<T>(tg: TestGame, gen: Gen<T>): T {
  let next = gen.next();
  for (let guard = 0; !next.done; guard++) {
    if (guard > 500) throw new Error('Gerador de montagem não terminou');
    const d = next.value as LiveDecision;
    const answer = tg.respond(d);
    const error = validateShape(d, answer) ?? d.validate?.(answer);
    if (error) throw new Error(`Montagem: ${d.prompt}: ${error}`);
    next = gen.next(answer);
  }
  tg.g.bump();
  tg.refresh();
  tg.settle();
  return next.value;
}

export function enterCard(tg: TestGame, name: string, player: PlayerId): ObjId | undefined {
  // Os testes que conferem conjuração usam tg.cast; este atalho cobre entrada por efeito.
  const card = Math.max(0, ...Object.keys(tg.state.cards).map(Number)) + 1;
  tg.state.cards[card] = { id: card, def: name, owner: player, isCommander: false };
  const o = createObject(tg.g, { def: name, card, owner: player, zone: 'hand' });
  return runEffect(tg, putOntoBattlefield(tg.g, [{ id: o.id, controller: player }], 'effect'))[0];
}

export function removeCard(tg: TestGame, id: ObjId): void {
  runEffect(tg, moveObjects(tg.g, [{ id, to: 'graveyard' }], 'effect'));
}
