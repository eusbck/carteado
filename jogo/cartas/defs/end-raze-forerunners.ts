// End-Raze Forerunners
// Vigilance, trample, haste
// When this creature enters, other creatures you control get +2/+2 and gain vigilance and trample until end of turn.
import { controlledBy, defineCard, etb, isCreature, keywords, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'End-Raze Forerunners',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample', 'haste'),
      // ruling 1: só as criaturas que você controla na resolução (CR 611.2c)
      etb(function* (c) {
        const ids = controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id));
        untilEndOfTurn(c, ids, [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'trample' }]);
      }, { text: 'Quando esta criatura entra, as outras criaturas que você controla recebem +2/+2 e ganham vigilância e atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: as outras criaturas que você controla recebem +2/+2, vigilância e atropelar; as que chegam depois não',
  },
});
