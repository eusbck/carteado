// Headless Rider
// Whenever this creature or another nontoken Zombie you control dies, create a 2/2 black Zombie creature token.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Headless Rider',
  faces: [{
    abilities: [
      // olha para trás (CR 603.10a): morrendo junto com outros Zombies, dispara por cada um
      triggered(on.dies((c, l, old, e) => e.old === c.source || (!old.isToken && l.subtypes.includes('Zombie') && l.controller === c.you)), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1);
      }, { text: 'Sempre que esta criatura ou outro Zombie não ficha que você controla morre, crie uma ficha de criatura Zombie preta 2/2.' }),
    ],
  }],
  rulings: {},
});
