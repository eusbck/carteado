// Scrawling Crawler
// At the beginning of your upkeep, each player draws a card.
// Whenever an opponent draws a card, that player loses 1 life.
import { defineCard, draw, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Scrawling Crawler",
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function*(c) { for (const p of c.g.apnap()) yield* draw(c.g, p, 1); }, { text: 'No início da sua manutenção, cada jogador compra uma carta.' }),
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player) ? { player: e.player } : false), function*(c) { loseLife(c.g, c.event.player as number, 1, c.source); }, { text: 'Sempre que um oponente compra uma carta, ele perde 1 de vida.' }),
    ]
  }],
  rulings: {},
});
