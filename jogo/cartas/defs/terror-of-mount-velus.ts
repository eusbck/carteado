// Terror of Mount Velus
// Flying
// Double strike
// When this creature enters, creatures you control gain double strike until end of turn.
import { creaturesOf, defineCard, etb, keywords, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Terror of Mount Velus',
  faces: [{
    abilities: [
      ...keywords('flying', 'double strike'),
      // ruling 2 / CR 611.2c: só as criaturas que você controla na resolução; ruling 1: duas instâncias são redundantes
      etb(function* (c) {
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'double strike' }]);
      }, { text: 'Quando esta criatura entra, as criaturas que você controla ganham golpe duplo até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 702.4e: golpe duplo duas vezes é redundante',
    2: 'teste: CR 611.2c: só as criaturas que você controla na resolução ganham golpe duplo',
  },
});
