// Beledros Witherbloom
// Flying
// At the beginning of each upkeep, create a 1/1 black and green Pest creature token with "When this token dies, you
// gain 1 life."
// Pay 10 life: Untap all lands you control. Activate only once each turn.
import { activated, controlledBy, createTokens, defineCard, isLand, keyword, on, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Beledros Witherbloom',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.upkeep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Pest', 1); }, {
        text: 'No início de cada manutenção, crie uma ficha de criatura Pest preta e verde 1/1 com "Quando esta ficha morre, você ganha 1 de vida."',
      }),
      activated('Pay 10 life', function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isLand(c.g, x))) untap(c.g, id);
      }, { oncePerTurn: true, text: 'Pague 10 de vida: Desvire todos os terrenos que você controla. Ative só uma vez a cada turno.' }),
    ],
  }],
  rulings: {},
});
