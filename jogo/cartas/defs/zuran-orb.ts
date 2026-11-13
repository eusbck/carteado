// Zuran Orb
// Sacrifice a land: You gain 2 life.
import { activated, defineCard, gainLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Zuran Orb',
  faces: [{
    abilities: [
      activated('Sacrifice a land', function* (c) {
        gainLife(c.g, c.you, 2, c.source);
      }, { text: 'Sacrifique um terreno: Você ganha 2 pontos de vida.' }),
    ],
  }],
  rulings: {},
});
