// Nine-Lives Familiar
// This creature enters with eight revival counters on it if you cast it.
// When this creature dies, if it had a revival counter on it, return it to the battlefield with one fewer revival
// counter on it at the beginning of the next end step.
import { defineAbility, defineCard, delayed, entersWithCounters, nextEndStepTrigger, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VOLTA = defineAbility('Nine-Lives Familiar:volta', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId;
  const n = c.data.n as number;
  if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
  yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.g.state.objects[carta].owner, counters: n > 0 ? { revival: n } : {} }], 'effect');
}, 'No início da próxima etapa final, devolva Nine-Lives Familiar ao campo de batalha com um marcador de renascimento a menos.'));

/** marcadores de renascimento que a criatura tinha ao morrer (pela última informação, CR 603.10a) */
const marcadoresAoMorrer = (g: Parameters<typeof putOntoBattlefield>[0], old: ObjId): number => g.state.lki[old]?.obj.counters.revival ?? 0;

export default defineCard({
  name: 'Nine-Lives Familiar',
  faces: [{
    abilities: [
      // "se você a conjurou": entrou vinda de uma mágica (CR 601)
      entersWithCounters('revival', (_c, ev) => (ev.spell ? 8 : 0)),
      // condição interveniente (CR 603.4): tinha marcador ao morrer
      triggered(on.selfDies(), function* (c) {
        delayed(c, VOLTA.id!, { data: { carta: c.event.obj as ObjId, n: marcadoresAoMorrer(c.g, c.event.old as ObjId) - 1 } });
      }, {
        condition: (c) => marcadoresAoMorrer(c.g, c.event.old as ObjId) > 0,
        text: 'Quando esta criatura morre, se tinha um marcador de renascimento, devolva-a ao campo de batalha com um marcador de renascimento a menos no início da próxima etapa final.',
      }),
    ],
  }],
  rulings: {},
});
