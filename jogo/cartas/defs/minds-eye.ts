// Mind's Eye
// Whenever an opponent draws a card, you may pay {1}. If you do, draw a card.
import { defineCard, draw, mayPay, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Mind's Eye",
  faces: [{ abilities: [triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player)), function*(c) { if (yield* mayPay(c, c.you, '{1}', "Mind's Eye: comprar uma carta")) yield* draw(c.g, c.you, 1); }, { text: 'Sempre que um oponente compra uma carta, você pode pagar {1}. Se fizer isso, compre uma carta.' })] }],
  rulings: {},
});
