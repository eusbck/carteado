// Halimar Depths
// This land enters tapped.
// When this land enters, look at the top three cards of your library, then put them back in any order.
// {T}: Add {U}.
import { defineCard, etb, land, mana } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

export default defineCard({
  name: 'Halimar Depths',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) {
        yield* reordenaTopoDe(c, c.you, 3, 'Halimar Depths');
      }, { text: 'Quando este terreno entra, olhe as três cartas do topo do seu grimório e coloque-as de volta em qualquer ordem.' }),
      mana('U', { text: '{T}: Adicione {U}.' }),
    ],
  }],
  rulings: {},
});
