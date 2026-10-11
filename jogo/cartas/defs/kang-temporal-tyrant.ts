// Kang, Temporal Tyrant
// Whenever Kang attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1
// counter on this creature.)
// Whenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life.
import { connive, defineCard, gainLife, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Kang, Temporal Tyrant',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) { yield* connive(c.g, c.source); }, { text: 'Sempre que Kang ataca, ele trama.' }),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you && e.nth === 2), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que você compra a sua segunda carta em cada turno, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {},
});
