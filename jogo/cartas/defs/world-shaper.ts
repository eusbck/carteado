// World Shaper
// Whenever this creature attacks, you may mill three cards.
// When this creature dies, return all land cards from your graveyard to the battlefield tapped.
import { defineCard, mill, on, triggered, yesNo } from '../../motor/api.ts';
import { terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'World Shaper',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) { if (yield* yesNo(c.g, c.you, 'World Shaper: moer três cartas?')) yield* mill(c.g, c.you, 3); }, { text: 'Sempre que esta criatura ataca, você pode moer três cartas.' }),
      triggered(on.selfDies(), function* (c) { yield* terrenosDoCemiterio(c); }, { text: 'Quando esta criatura morre, devolva todas as cartas de terreno do seu cemitério ao campo de batalha viradas.' }),
    ],
  }],
  rulings: {},
});
