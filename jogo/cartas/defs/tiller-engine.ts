// Tiller Engine
// Whenever a land you control enters tapped, choose one —
// • Untap that land.
// • Tap target nonland permanent an opponent controls.
import { controllerOf, defineCard, isLand, modal, on, t, tap, tgt, triggered, untap } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Tiller Engine',
  faces: [{
    abilities: [
      // "entra virado": como entrou (o estado logo depois do evento)
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.to !== 'battlefield') return false;
        const o = c.g.state.objects[e.obj];
        return !!o && o.tapped && isLand(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { terreno: e.obj } : false;
      }), function* () { /* os modos fazem o efeito */ }, {
        modes: modal(1, 1, [
          {
            text: 'Desvire esse terreno',
            *effect(c) {
              const id = c.event.terreno as ObjId;
              if (c.g.state.objects[id]?.zone === 'battlefield') untap(c.g, id);
            },
          },
          {
            text: 'Vire a permanente alvo que não é terreno que um oponente controla',
            targets: [t.permanent((c, id) => !isLand(c.g, id) && c.g.isOpponent(c.you, controllerOf(c.g, id)), 'permanente alvo, que não é terreno, de um oponente')],
            *effect(c) { const id = tgt(c); if (id !== null) tap(c.g, id); },
          },
        ]),
        text: 'Sempre que um terreno que você controla entra virado, escolha um — • Desvire esse terreno. • Vire a permanente alvo que não é terreno que um oponente controla.',
      }),
    ],
  }],
  rulings: {},
});
