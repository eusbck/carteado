// Vile Entomber
// Deathtouch
// When this creature enters, search your library for a card, put that card into your graveyard, then shuffle.
import { defineCard, etb, keyword, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Vile Entomber',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      etb(function* (c) { yield* searchTo(c, c.you, () => true, 1, 'graveyard', { prompt: 'Procure uma carta para colocar no cemitério' }); }, {
        text: 'Quando esta criatura entra, procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe.',
      }),
    ],
  }],
  rulings: {},
});
