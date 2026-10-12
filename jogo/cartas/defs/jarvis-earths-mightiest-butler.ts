// Jarvis, Earth's Mightiest Butler
// Whenever you cast a Hero spell, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: "Jarvis, Earth's Mightiest Butler",
  faces: [{
    abilities: [
      triggered(on.youCast((c, id) => ehHeroi(c.g, id)), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que você conjura uma mágica de Hero, compre uma carta.' }),
    ],
  }],
  rulings: {},
});