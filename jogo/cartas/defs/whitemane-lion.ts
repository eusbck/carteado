// Whitemane Lion
// Flash
// When this creature enters, return a creature you control to its owner's hand.
import { defineCard, etb, keyword } from '../../motor/api.ts';
import { devolveCriatura } from '../gatos.ts';

export default defineCard({
  name: 'Whitemane Lion',
  faces: [{
    abilities: [
      // CR 702.8a
      keyword('flash'),
      // rulings 1-2: sem alvo; escolhida na resolução, pode ser ele mesmo, e é obrigatório
      etb(function* (c) { yield* devolveCriatura(c, 'Whitemane Lion'); }, { text: 'Quando esta criatura entra, devolva uma criatura que você controla para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode devolver a si mesmo; sem outra criatura, é obrigado',
    2: 'teste: devolve uma criatura sua escolhida na resolução, sem alvo',
  },
});
