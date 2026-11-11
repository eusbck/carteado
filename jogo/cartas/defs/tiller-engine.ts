// Tiller Engine
// Whenever a land you control enters tapped, choose one —
// • Untap that land.
// • Tap target nonland permanent an opponent controls.
import { and, controllerOf, defineCard, is, isLand, on, t, tap, tgt, triggered, untap } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Tiller Engine',
  faces: [{
    abilities: [triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj)
      && controllerOf(c.g, e.obj) === c.you && c.g.state.objects[e.obj].tapped ? { terra: e.obj } : false)), function* () { /* modos */ }, {
      modes: {
        min: 1, max: 1,
        modes: [
          { text: 'Desvire esse terreno.', *effect(c) { const id = c.event.terra as ObjId; if (c.g.state.objects[id]?.zone === 'battlefield') untap(c.g, id); } },
          { text: 'Vire o permanente não terreno alvo que um oponente controla.', targets: [t.nonlandPermanent(and(is.opponents), 'permanente não terreno alvo de um oponente')], *effect(c) { const id = tgt(c); if (id !== null) tap(c.g, id); } },
        ],
      },
      text: 'Sempre que um terreno que você controla entra virado, escolha um — Desvire esse terreno; ou vire o permanente não terreno alvo que um oponente controla.',
    })],
  }],
  rulings: {},
});
