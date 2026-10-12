// April O'Neil, Live on the Scene
// Whenever a Mutant, Ninja, or Turtle you control enters, investigate. (Create a Clue token. It's an artifact with "{2},
// Sacrifice this token: Draw a card.")
// Partner—Character select
import { and, chars, defineCard, investigate, is, on, triggered } from '../../motor/api.ts';
import { SELECAO } from '../tartarugas.ts';

export default defineCard({
  name: "April O'Neil, Live on the Scene",
  faces: [{
    abilities: [
      triggered(on.enters(and(is.yours, (c, id) => chars(c.g, id).subtypes.some((s) => s === 'Mutant' || s === 'Ninja' || s === 'Turtle'))), function* (c) {
        yield* investigate(c.g, c.you);
      }, { text: 'Sempre que um Mutant, Ninja ou Turtle que você controla entra, investigue. (Crie uma ficha Clue.)' }),
    ],
  }],
  rulings: {
    1: SELECAO.comecam,
    2: SELECAO.separados,
    3: SELECAO.dois,
    4: SELECAO.refere,
    5: SELECAO.controla,
    6: SELECAO.identidade,
    7: SELECAO.perder,
  },
});