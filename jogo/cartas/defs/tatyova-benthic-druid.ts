// Tatyova, Benthic Druid — Landfall — Whenever a land you control enters, you gain 1 life and draw a card.
import { defineCard, draw, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tatyova, Benthic Druid',
  faces: [{
    abilities: [triggered(on.landfall(), function* (c) { gainLife(c.g, c.you, 1, c.source); yield* draw(c.g, c.you, 1); },
      { text: 'Queda de terreno — Sempre que um terreno que você controla entra, você ganha 1 de vida e compra uma carta.' })],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — cada terreno dispara uma vez, inclusive os que entram juntos',
    2: 'regra geral: CR 305.2 — vale para terrenos postos no campo, não só jogados',
    3: 'regra geral: CR 603.2 — um terreno que entra sob o seu controle conta mesmo sendo de outro dono',
  },
});
