// Mesmeric Orb — Whenever a permanent becomes untapped, that permanent's controller mills a card.
import { controllerOf, defineCard, mill, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mesmeric Orb',
  faces: [{
    abilities: [triggered(on.custom((e, c) => (e.type === 'untap' && !!c.g.state.objects[e.obj] ? { quem: controllerOf(c.g, e.obj) } : false)), function* (c) {
      yield* mill(c.g, c.event.quem as PlayerId, 1);
    }, { text: 'Sempre que um permanente é desvirado, o controlador dele moe uma carta.' })],
  }],
  rulings: { 1: 'regra geral: CR 502.3 — dispara por cada permanente desvirado na etapa de desvirar' },
});
