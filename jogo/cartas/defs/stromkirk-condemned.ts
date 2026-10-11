// Stromkirk Condemned
// Discard a card: Vampires you control get +1/+1 until end of turn. Activate only once each turn.
import { activated, controlledBy, defineCard, isCreature, isSubtype, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Stromkirk Condemned',
  faces: [{
    abilities: [
      activated('Discard a card', function* (c) {
        // ruling 2: só os Vampires que você controla na resolução
        const ids = controlledBy(c.g, c.you, (x) => isCreature(c.g, x) && isSubtype(c.g, x, 'Vampire'));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 1, t: 1 }]);
      }, { oncePerTurn: true, text: 'Descarte uma carta: Os Vampires que você controla recebem +1/+1 até o fim do turno. Ative só uma vez por turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.35a — o Vampire com loucura descartado no custo é conjurado e entra antes de a habilidade resolver, e recebe o bônus',
    2: 'teste: descartando uma carta, os seus Vampires recebem +1/+1, só uma vez por turno',
  },
});
