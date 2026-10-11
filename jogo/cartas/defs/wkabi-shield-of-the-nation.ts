// W'Kabi, Shield of the Nation
// Vigilance
// Whenever you attack with your commander, if you control an artifact with mana value 4 or greater, create a 4/4 green
// Rhino creature token with trample.
import { createTokens, defineCard, keyword, manaValue, on, triggered } from '../../motor/api.ts';
import { artefatosDe, ehComandanteDe } from '../wakanda.ts';

export default defineCard({
  name: "W'Kabi, Shield of the Nation",
  faces: [{
    abilities: [
      keyword('vigilance'),
      triggered(on.custom((e, c) => e.type === 'attackers' && e.player === c.you && e.attackers.some((a) => ehComandanteDe(c.g, a.obj, c.you))), function* (c) {
        yield* createTokens(c.g, c.you, 'Rhino', 1);
      }, {
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => artefatosDe(c.g, c.you).some((id) => manaValue(c.g, id) >= 4),
        text: 'Sempre que você ataca com o seu comandante, se você controla um artefato com valor de mana 4 ou maior, crie uma ficha de criatura Rhino 4/4 verde com atropelar.',
      }),
    ],
  }],
  rulings: {},
});