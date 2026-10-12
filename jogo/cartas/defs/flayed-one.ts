// Flayed One
// Lifelink
// Flesh Flayer — When this creature enters, mill three cards.
import { defineCard, etb, keyword, mill } from '../../motor/api.ts';

export default defineCard({
  name: 'Flayed One',
  faces: [{
    abilities: [
      keyword('lifelink'),
      etb(function* (c) { yield* mill(c.g, c.you, 3); }, { text: 'Flesh Flayer — Quando esta criatura entra, triture três cartas.' }),
    ],
  }],
  rulings: {},
});