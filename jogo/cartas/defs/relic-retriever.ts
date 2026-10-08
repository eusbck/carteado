// Relic Retriever
// First strike
// At the beginning of each end step, if a card left your graveyard this turn, create a Treasure token.
import { createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Relic Retriever',
  faces: [{
    abilities: [
      keyword('first strike'),
      triggered(on.endStep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, {
        // ruling 1: verificado ao começar a etapa final (CR 603.4)
        condition: (c) => c.g.state.turnStats[c.you].cardsLeftGraveyard > 0,
        text: 'No início de cada etapa final, se uma carta saiu do seu cemitério neste turno, crie uma ficha de Tesouro.',
      }),
    ],
  }],
  rulings: { 1: 'teste: sem carta saindo do cemitério, não dispara' },
});
