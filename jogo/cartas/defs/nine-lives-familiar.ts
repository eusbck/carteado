// Nine-Lives Familiar
// This creature enters with eight revival counters on it if you cast it.
// When this creature dies, if it had a revival counter on it, return it to the battlefield with one fewer revival
// counter on it at the beginning of the next end step.
import { asEnters, defineAbility, defineCard, delayed, nextEndStepTrigger, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VOLTA = defineAbility('Nine-Lives Familiar:volta', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId | undefined;
  const n = (c.data.marcadores as number | undefined) ?? 0;
  if (carta === undefined || c.g.state.objects[carta]?.zone !== 'graveyard') return;
  yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.g.state.objects[carta].owner, counters: n > 0 ? { revival: n } : {} }], 'effect');
}, 'No início da próxima etapa final, devolva Nine-Lives Familiar ao campo com um marcador de renascimento a menos.'));

export default defineCard({
  name: 'Nine-Lives Familiar',
  faces: [{
    abilities: [
      asEnters((_c, ev) => { if (ev.spell) ev.counters.revival = (ev.counters.revival ?? 0) + 8; }, 'Esta criatura entra com oito marcadores de renascimento se você a conjurou.'),
      triggered(on.selfDies(), function* (c) {
        const antes = (c.g.state.lki[c.event.old as ObjId]?.obj.counters.revival ?? 0);
        if (antes <= 0) return;
        delayed(c, VOLTA.id!, { data: { carta: c.event.obj, marcadores: antes - 1 } });
      }, {
        text: 'Quando esta criatura morre, se tinha um marcador de renascimento, devolva-a ao campo com um marcador a menos no início da próxima etapa final.',
      }),
    ],
  }],
  rulings: {},
});
