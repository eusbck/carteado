// Faerie Mastermind
// Flash
// Flying
// Whenever an opponent draws their second card each turn, you draw a card.
// {3}{U}: Each player draws a card.
import { activated, defineCard, draw, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Faerie Mastermind',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      // as estatísticas do turno já contam a compra quando o gatilho é verificado
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player].cardsDrawn === 2), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente compra a segunda carta dele num turno, você compra uma carta.' }),
      activated('{3}{U}', function* (c) { for (const p of c.g.apnap()) yield* draw(c.g, p, 1); }, { text: '{3}{U}: Cada jogador compra uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: dispara mesmo que a Mastermind tenha entrado depois da primeira compra' },
});
