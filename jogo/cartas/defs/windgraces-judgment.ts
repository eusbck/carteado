// Windgrace's Judgment
// For any number of opponents, destroy target nonland permanent that player controls.
import { controllerOf, defineCard, destroy, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: "Windgrace's Judgment",
  faces: [{
    spell: {
      // uma lista só de alvos, no máximo um por oponente
      targets: [{
        ...t.nonlandPermanent((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'para cada oponente que quiser, uma permanente não terreno alvo que ele controla'),
        min: 0, max: (c) => c.g.opponents(c.you).length,
        validateSet: (c, escolhidos) => {
          const donos = escolhidos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
          return new Set(donos).size === donos.length;
        },
      }],
      *effect(c) { yield* destroy(c.g, tgtsAll(c, 0)); },
    },
  }],
  rulings: {},
});
