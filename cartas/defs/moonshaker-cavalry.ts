// Moonshaker Cavalry
// Flying
// When this creature enters, creatures you control gain flying and get +X/+X until end of turn, where X is the number
// of creatures you control.
import { creaturesOf, defineCard, etb, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Moonshaker Cavalry',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        // rulings 1-2: X e o conjunto de criaturas fixados na resolução
        const minhas = creaturesOf(c.g, c.you);
        const x = minhas.length;
        untilEndOfTurn(c, minhas, [{ k: 'addKeyword', kw: 'flying' }, { k: 'pt', p: x, t: x }]);
      }, { text: 'Quando esta criatura entra, as criaturas que você controla ganham voar e recebem +X/+X até o fim do turno, onde X é o número de criaturas que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: X fixado na resolução, contando a própria Cavalry',
    2: 'teste: criaturas que entram depois não são afetadas',
  },
});
