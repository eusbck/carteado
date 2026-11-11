// Aftermath Analyst
// When this creature enters, mill three cards.
// {3}{G}, Sacrifice this creature: Return all land cards from your graveyard to the battlefield tapped.
import { activated, defineCard, etb, mill } from '../../motor/api.ts';
import { terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Aftermath Analyst',
  faces: [{
    abilities: [
      etb(function* (c) { yield* mill(c.g, c.you, 3); }, { text: 'Quando esta criatura entra, moa três cartas.' }),
      activated('{3}{G}, Sacrifice this creature', function* (c) { yield* terrenosDoCemiterio(c); }, { text: '{3}{G}, Sacrifique esta criatura: Devolva todas as cartas de terreno do seu cemitério ao campo de batalha viradas.' }),
    ],
  }],
  rulings: {},
});
