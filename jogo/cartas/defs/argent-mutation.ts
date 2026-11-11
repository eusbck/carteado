// Argent Mutation
// Target permanent becomes an artifact in addition to its other types until end of turn.
// Draw a card.
import { defineCard, draw, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Argent Mutation',
  faces: [{
    spell: {
      targets: [t.permanent()],
      *effect(c) {
        const id = tgt(c);
        // camada 4 (CR 613.1d): ganha o tipo artefato além dos outros; ruling 1: num artefato não muda nada
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addTypes', types: ['Artifact'] }]);
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: mirando um artefato, só compra a carta',
    2: 'teste: com o alvo ilegal na resolução, não resolve e você não compra',
  },
});
