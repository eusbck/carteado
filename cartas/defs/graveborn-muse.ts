// Graveborn Muse
// At the beginning of your upkeep, you draw X cards and lose X life, where X is the number of Zombies you control.
import { controlledBy, defineCard, draw, isSubtype, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Graveborn Muse',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        // X é contado uma vez, na resolução (CR 608.2h)
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Zombie')).length;
        if (x <= 0) return;
        yield* draw(c.g, c.you, x);
        loseLife(c.g, c.you, x, c.source);
      }, { text: 'No início da sua manutenção, você compra X cartas e perde X de vida, onde X é o número de Zombies que você controla.' }),
    ],
  }],
  rulings: {},
});
