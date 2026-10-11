// Shuri, the Black Panther
// Lifelink
// Whenever Shuri attacks, draw a card if you control three or more artifacts. Then if you control six or more artifacts,
// creatures you control get +2/+2 until end of turn.
import { creaturesOf, defineCard, draw, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Shuri, the Black Panther',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.selfAttacks(), function* (c) {
        if (artefatosDe(c.g, c.you).length >= 3) yield* draw(c.g, c.you, 1);
        if (artefatosDe(c.g, c.you).length >= 6) {
          const ids = creaturesOf(c.g, c.you);
          if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 2, t: 2 }]);
        }
      }, { text: 'Sempre que Shuri ataca, compre uma carta se você controla três ou mais artefatos. Depois, se você controla seis ou mais artefatos, as criaturas que você controla recebem +2/+2 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});