// Whirlwind of Thought
// Whenever you cast a noncreature spell, draw a card.
import { defineCard, draw, is, not, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Whirlwind of Thought',
  faces: [{
    abilities: [
      // rulings 1-2: o gatilho resolve antes da mágica, mesmo que ela seja anulada (CR 603.3, 117.3c)
      triggered(on.youCast(not(is.creature)), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Sempre que você conjura uma mágica que não é de criatura, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 117.3c — há prioridade entre a resolução do gatilho e a da mágica',
    2: 'teste: o gatilho resolve antes da mágica e mesmo que ela seja anulada',
  },
});
