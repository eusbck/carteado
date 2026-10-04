// Solemn Simulacrum
// When this creature enters, you may search your library for a basic land card, put that card onto the battlefield
// tapped, then shuffle.
// When this creature dies, you may draw a card.
import { defineCard, draw, etb, maySearchBasicToBattlefield, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Solemn Simulacrum',
  faces: [{
    abilities: [
      etb(function* (c) { yield* maySearchBasicToBattlefield(c, c.you, true); }, { text: 'Quando esta criatura entra, você pode procurar uma carta de terreno básico, colocá-la no campo virada e embaralhar.' }),
      triggered(on.selfDies(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Solemn Simulacrum: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Quando esta criatura morre, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {},
});
