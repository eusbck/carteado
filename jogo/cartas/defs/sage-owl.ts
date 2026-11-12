// Sage Owl
// Flying
// When this creature enters, look at the top four cards of your library, then put them back in any order.
import { defineCard, etb, keyword } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

export default defineCard({
  name: 'Sage Owl',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* reordenaTopoDe(c, c.you, 4, 'Sage Owl'); }, { text: 'Quando esta criatura entra, olhe as quatro cartas do topo do seu grimório e coloque-as de volta em qualquer ordem.' }),
    ],
  }],
  rulings: {},
});
