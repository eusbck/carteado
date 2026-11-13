// Aesi, Tyrant of Gyre Strait
// You may play an additional land on each of your turns.
// Landfall — Whenever a land you control enters, you may draw a card.
import { defineCard, draw, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Aesi, Tyrant of Gyre Strait',
  faces: [{
    abilities: [
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      triggered(on.landfall(), function* (c) { if (yield* yesNo(c.g, c.you, 'Aesi: comprar uma carta?')) yield* draw(c.g, c.you, 1); },
        { text: 'Queda de terreno — Sempre que um terreno que você controla entra, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 305.2 — os terrenos adicionais se somam',
    2: 'regra geral: CR 305.2 — só nos seus turnos',
    3: 'regra geral: CR 603.2 — vale para terrenos postos no campo',
    4: 'regra geral: CR 603.5 — comprar é opcional',
  },
});
