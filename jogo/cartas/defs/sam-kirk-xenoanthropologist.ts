// Sam Kirk, Xenoanthropologist
// Whenever an opponent casts a creature spell, investigate. (Create a Clue token. It's an artifact with "{2},
// Sacrifice this token: Draw a card.")
import { defineCard, investigate, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sam Kirk, Xenoanthropologist',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj)), function* (c) {
        yield* investigate(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente conjura uma mágica de criatura, investigue. (Crie uma ficha Clue: um artefato com "{2}, sacrifique esta ficha: compre uma carta".)' }),
    ],
  }],
  rulings: {},
});
