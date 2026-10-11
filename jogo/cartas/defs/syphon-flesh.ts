// Syphon Flesh
// Each other player sacrifices a creature of their choice. You create a 2/2 black Zombie creature token for each
// creature sacrificed this way.
import { createTokens, defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Syphon Flesh',
  faces: [{
    spell: {
      *effect(c) {
        const outros = c.g.apnap().filter((p) => p !== c.you);
        const sacrificadas = yield* eachSacrifices(c, outros, (id) => isCreature(c.g, id), 1, 'uma criatura');
        if (sacrificadas.length) yield* createTokens(c.g, c.you, 'Zombie 2/2', sacrificadas.length);
      },
    },
  }],
  rulings: {},
});