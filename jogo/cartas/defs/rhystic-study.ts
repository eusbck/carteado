// Rhystic Study
// Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.
import { defineCard, on, triggered } from '../../motor/api.ts';
import { compraAMenosQuePague } from '../twitch.ts';

export default defineCard({
  name: 'Rhystic Study',
  faces: [{
    abilities: [
      // ruling 1: o gatilho resolve antes da mágica, mesmo que ela seja anulada; ruling 2: o oponente decide se paga
      // primeiro, e só depois você decide se compra
      triggered(on.custom((e, c) => (e.type === 'cast' && c.g.isOpponent(c.you, e.player) ? { jogador: e.player } : false)), function* (c) {
        yield* compraAMenosQuePague(c, c.event.jogador as number, '{1}', 'Rhystic Study');
      }, { text: 'Sempre que um oponente conjura uma mágica, você pode comprar uma carta a menos que esse jogador pague {1}.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica que o disparou',
    2: 'teste: o oponente decide se paga antes; sem pagamento, você escolhe se compra',
  },
});
