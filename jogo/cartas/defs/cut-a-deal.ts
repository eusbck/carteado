// Cut a Deal
// Each opponent draws a card, then you draw a card for each opponent who drew a card this way.
import { defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Cut a Deal',
  faces: [{
    spell: {
      *effect(c) {
        let compraram = 0;
        // rulings 1-2: conta o oponente que comprou pelo menos uma carta assim, uma vez só
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const cartas = yield* draw(c.g, p, 1);
          if (cartas.length > 0) compraram++;
        }
        if (compraram > 0) yield* draw(c.g, c.you, compraram);
      },
    },
  }],
  rulings: {
    1: 'teste: o oponente que não compra (grimório vazio) não conta',
    2: 'regra geral: a conta é por oponente que comprou, não por carta comprada (cartas/defs/cut-a-deal.ts)',
  },
});
