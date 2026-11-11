// Up the Beanstalk
// When this enchantment enters and whenever you cast a spell with mana value 5 or greater, draw a card.
import { defineCard, draw, etb, manaValue, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Up the Beanstalk',
  faces: [{
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando este encantamento entra, compre uma carta.' }),
      // ruling 1: o valor de mana na pilha já conta o X escolhido (CR 202.3e)
      triggered(on.youCast((c, id) => manaValue(c.g, id) >= 5), function* (c) { yield* draw(c.g, c.you, 1); },
        { text: 'Sempre que você conjura uma mágica com valor de mana 5 ou mais, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — na pilha, o valor de mana conta o X escolhido (motor/chars.ts)',
  },
});
