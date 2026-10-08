// Welcoming Vampire
// Flying
// Whenever one or more other creatures you control with power 2 or less enter, draw a card. This ability triggers only
// once each turn.
import { and, defineCard, draw, is, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Welcoming Vampire',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-2: força conferida no momento em que entram (com marcadores e efeitos já aplicados)
      triggered(on.entersBatch(and(is.creature, is.yours, is.other, is.powerAtMost(2))), function* (c) { yield* draw(c.g, c.you, 1); }, {
        oncePerTurn: true,
        text: 'Sempre que uma ou mais outras criaturas com força 2 ou menos que você controla entram, compre uma carta. Esta habilidade só dispara uma vez a cada turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: força conferida ao entrar',
    2: 'teste: entrando com marcadores +1/+1, conta a força com eles',
  },
});
