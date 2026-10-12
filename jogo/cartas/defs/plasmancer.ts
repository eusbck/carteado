// Plasmancer
// Flying
// Dynastic Advisor — When this creature enters, search your library for a basic Swamp card, reveal it, put it into your
// hand, then shuffle.
import { defineCard, etb, isBasicLand, isSubtype, keyword, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Plasmancer',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id) && isSubtype(c.g, id, 'Swamp'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Swamp básico' });
      }, { text: 'Dynastic Advisor — Quando esta criatura entra, procure no seu grimório uma carta de Swamp básico, revele-a, coloque-a na sua mão e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});