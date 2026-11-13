// Awaken the Woods
// Create X 1/1 green Forest Dryad land creature tokens. (They're affected by summoning sickness.)
import { createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Awaken the Woods',
  faces: [{
    spell: {
      *effect(c) {
        // criatura terreno com o tipo Forest: "{T}: Adicione {G}" pelo tipo (CR 305.6), sujeita ao enjoo (302.6)
        yield* createTokens(c.g, c.you, 'Forest Dryad', c.x);
      },
    },
  }],
  rulings: {},
});
