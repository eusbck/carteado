// Fleetfoot Panther
// Flash
// When this creature enters, return a green or white creature you control to its owner's hand.
import { chars, defineCard, etb, keyword } from '../../motor/api.ts';
import { devolveCriatura } from '../gatos.ts';

export default defineCard({
  name: 'Fleetfoot Panther',
  faces: [{
    abilities: [
      keyword('flash'),
      // ruling 1: sem alvo; escolhida na resolução (a própria Panther é verde e branca e pode ser a escolhida)
      etb(function* (c) {
        yield* devolveCriatura(c, 'Fleetfoot Panther', (id) => chars(c.g, id).colors.some((cor) => cor === 'G' || cor === 'W'));
      }, { text: 'Quando esta criatura entra, devolva uma criatura verde ou branca que você controla para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: devolve uma criatura verde ou branca sua, escolhida na resolução',
  },
});
