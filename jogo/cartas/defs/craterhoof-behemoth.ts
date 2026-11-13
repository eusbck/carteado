// Craterhoof Behemoth
// Haste
// When this creature enters, creatures you control gain trample and get +X/+X until end of turn, where X is the number
// of creatures you control.
import { controlledBy, defineCard, etb, isCreature, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Craterhoof Behemoth',
  faces: [{
    abilities: [
      keyword('haste'),
      etb(function* (c) {
        const ids = controlledBy(c.g, c.you, (id) => isCreature(c.g, id));
        const x = ids.length;
        if (x) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'trample' }, { k: 'pt', p: x, t: x }]);
      }, { text: 'Quando esta criatura entra, as criaturas que você controla ganham atropelar e recebem +X/+X até o fim do turno, onde X é o número de criaturas que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2h — X é contado quando a habilidade resolve, e não muda depois',
    2: 'regra geral: CR 611.2c — só as criaturas que você controla nessa hora recebem o bônus',
  },
});
