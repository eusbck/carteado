// The Gaffer
// At the beginning of each end step, if you gained 3 or more life this turn, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'The Gaffer',
  faces: [{
    abilities: [
      // CR 603.4: "se" interveniente; conta a vida ganha no turno inteiro (rulings 1-3)
      triggered(on.endStep('each'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => c.g.state.turnStats[c.you].lifeGained >= 3,
        text: 'No início de cada etapa final, se você ganhou 3 ou mais pontos de vida neste turno, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com 3 ou mais de vida ganha no turno, compra uma carta na etapa final, também no turno do oponente',
    2: 'regra geral: conta a vida ganha no turno inteiro (TurnStats.lifeGained), sem descontar a perdida',
    3: 'teste: com menos de 3 de vida ganha, não compra',
  },
});
