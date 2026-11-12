// Aesi, Tyrant of Gyre Strait
// You may play an additional land on each of your turns.
// Landfall — Whenever a land you control enters, you may draw a card.
import { defineCard, draw, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';
import { ATERRAGEM } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Aesi, Tyrant of Gyre Strait',
  faces: [{
    abilities: [
      // CR 305.2: soma com os outros efeitos de terreno adicional
      staticAbility({
        rules: { extraLandPlays: (c, jogador) => (jogador === c.you ? 1 : 0) },
        text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.',
      }),
      triggered(on.landfall(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Aesi, Tyrant of Gyre Strait: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    ...ATERRAGEM('teste: você joga dois terrenos no turno, e cada um pode comprar uma carta'),
    4: 'teste: você joga dois terrenos no turno, e cada um pode comprar uma carta',
  },
});
