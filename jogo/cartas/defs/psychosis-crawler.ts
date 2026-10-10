// Psychosis Crawler
// Psychosis Crawler's power and toughness are each equal to the number of cards in your hand.
// Whenever you draw a card, each opponent loses 1 life.
import { defineCard, loseLife, on, selfGets, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Psychosis Crawler",
  faces: [{
    abilities: [
      selfGets((c) => { const n = c.g.state.zones.hand[c.you].length; return [{ k: 'setPT', p: n, t: n }]; }, 'F/R iguais ao número de cartas na sua mão.', { cda: true }),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function*(c) { for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source); }, { text: 'Sempre que você compra uma carta, cada oponente perde 1 de vida.' }),
    ]
  }],
  rulings: {
    "1": "CR 121.2: teste: comprar várias cartas dispara uma vez por carta; cada oponente perde essa quantidade de vida."
  },
});
