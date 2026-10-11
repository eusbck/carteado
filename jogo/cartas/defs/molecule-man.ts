// Molecule Man
// Nonland cards in your hand have miracle {0}. (You may cast a card for its miracle cost when you draw it if it's the
// first card you drew this turn.)
import { castSpell, defineCard, isLand, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Molecule Man',
  faces: [{
    abilities: [
      // CR 702.94a: milagre — ao comprar a primeira carta do turno, você pode revelá-la; quando faz isso, pode conjurá-la
      // pelo custo de milagre ({0}), em qualquer momento em que a compre. O gatilho sai de Molecule Man, que é quem dá o
      // milagre; a carta tem de continuar na sua mão quando ele resolve.
      triggered(on.custom((e, c) => (e.type === 'draw' && e.player === c.you && e.nth === 1 && !!c.g.state.objects[e.obj] && !isLand(c.g, e.obj) ? { carta: e.obj } : false)), function* (c) {
        const carta = c.event.carta as ObjId;
        const o = c.g.state.objects[carta];
        if (!o || o.zone !== 'hand' || o.owner !== c.you) return;
        if (!(yield* yesNo(c.g, c.you, `Milagre: conjurar ${nameOf(c.g, carta)} por {0}?`))) return;
        yield* castSpell(c.g, c.you, carta, { key: 'miracle', label: 'milagre {0}', zone: 'hand', free: true, duringResolution: true });
      }, { text: 'As cartas que não são terrenos na sua mão têm milagre {0}. (Você pode conjurar uma carta pelo custo de milagre quando a compra, se for a primeira carta que você comprou neste turno.)' }),
    ],
  }],
  rulings: {},
});
