// Faerie Seer
// Flying
// When this creature enters, scry 2.
import { defineCard, etb, keyword, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Faerie Seer',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 2, 'scry'); }, { text: 'Quando esta criatura entra, vidência 2.' }),
    ],
  }],
  rulings: {},
});
