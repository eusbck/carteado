// Champion of Dusk
// When this creature enters, you draw X cards and you lose X life, where X is the number of Vampires you control.
import { controlledBy, defineCard, draw, etb, isSubtype, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Champion of Dusk',
  faces: [{
    abilities: [
      // ruling 1: X é contado na resolução; se ainda estiver no campo, ele conta a si mesmo
      etb(function* (c) {
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Vampire')).length;
        if (x <= 0) return;
        yield* draw(c.g, c.you, x);
        loseLife(c.g, c.you, x, c.source);
      }, { text: 'Quando esta criatura entra, você compra X cartas e perde X de vida, onde X é o número de Vampires que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: X conta os Vampires que você controla na resolução, inclusive ele mesmo',
  },
});
