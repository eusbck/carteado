// Crackling Spellslinger
// Flash
// When this creature enters, if you cast it, the next instant or sorcery spell you cast this turn has storm. (When you
// cast that spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)
import { defineAbility, defineCard, delayed, etb, is, keyword, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';
import { copiasDeTempestade, magicasDoTurno } from '../esquilos.ts';

/** a permanente veio de uma mágica conjurada, de qualquer zona (ruling 1); a cópia de mágica não foi conjurada */
function foiConjurada(g: G, id: ObjId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  return (o?.data.spell as { castFrom?: string } | undefined)?.castFrom !== undefined;
}

/**
 * "A próxima mágica instantânea ou de feitiço que você conjurar neste turno tem tempestade": um gatilho atrasado que
 * dispara uma vez, quando essa mágica é conjurada, contando as mágicas conjuradas antes dela (CR 702.40a).
 * Simplificação: a habilidade de tempestade é do gatilho atrasado, não da mágica; o resultado na mesa é o mesmo.
 */
const TEMPESTADE = defineAbility('Crackling Spellslinger:tempestade', triggered(on.custom((e, c) => (
  e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj) ? { spell: e.obj, antes: magicasDoTurno(c.g) - 1 } : false
)), function* (c) {
  yield* copiasDeTempestade(c.g, c.event.spell as ObjId, c.you, Number(c.event.antes ?? 0));
}, { text: 'Tempestade (quando você conjura esta mágica, copie-a para cada mágica conjurada antes dela neste turno; você pode escolher novos alvos para as cópias).' }));

export default defineCard({
  name: 'Crackling Spellslinger',
  faces: [{
    abilities: [
      keyword('flash'),
      // CR 603.4: "se você a conjurou" é conferido ao disparar e ao resolver
      etb(function* (c) {
        delayed(c, TEMPESTADE.id!, { expiresTurn: c.g.state.turn.number });
      }, { condition: (c) => foiConjurada(c.g, c.source), text: 'Quando esta criatura entra, se você a conjurou, a próxima mágica instantânea ou de feitiço que você conjurar neste turno tem tempestade.' }),
    ],
  }],
  rulings: {
    1: 'teste: posta no campo sem ser conjurada, não dá tempestade',
    2: 'teste: conjurada, a próxima instantânea do turno tem tempestade e as cópias não contam como mágicas conjuradas',
    3: 'teste: conjurada, a próxima instantânea do turno tem tempestade e as cópias não contam como mágicas conjuradas',
    4: 'regra geral: CR 707.10 — cada cópia é anulada sozinha (motor/stack.ts counter)',
  },
});
