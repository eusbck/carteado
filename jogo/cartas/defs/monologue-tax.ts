// Monologue Tax
// Whenever an opponent casts their second spell each turn, you create a Treasure token.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Monologue Tax',
  faces: [{
    abilities: [
      // rulings 1-3: uma vez por oponente por turno; a primeira mágica conta mesmo antes do encantamento
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player].spellsCast === 2), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que um oponente conjura a segunda mágica dele num turno, você cria uma ficha de Tesouro.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: as estatísticas são por jogador e por turno',
    2: 'teste: a primeira mágica conta mesmo antes do encantamento',
    3: 'teste: a terceira mágica não dispara',
  },
});
